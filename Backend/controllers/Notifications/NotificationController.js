const Notification = require('../../models/NotificationModel');
const UserModel = require('../../models/UserModel');
const { sendNotification } = require('../../utils/socket');
const { sendMail, buildAnnouncementEmail } = require('../../utils/mailService');
const AnnouncementModel = require('../../models/AnnouncementModel');

module.exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const filter = { user: userId };
        const [items, total] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Notification.countDocuments(filter),
        ]);
        return res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

module.exports.unreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await Notification.countDocuments({ user: userId, read: false });
        res.json({ data: { count } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
};

module.exports.markRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ message: 'Notification id is required' });
        await Notification.updateOne({ _id: id, user: userId }, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to mark read' });
    }
};

module.exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to mark all read' });
    }
};

module.exports.clearAll = async (req, res) => {
    try {
        const userId = req.user.userId;
        await Notification.deleteMany({ user: userId });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to clear notifications' });
    }
};

module.exports.announce = async (req, res) => {
    try {
        const { userIds, title, message, meta } = req.body || {};
        if (!title || !message) {
            return res.status(400).json({ message: 'Announcement title and message are required' });
        }
        const payload = { type: 'admin_announcement', title, message, meta };

        // persist announcement record for admin history
        try {
            const record = new AnnouncementModel({ title, message, meta, userIds: Array.isArray(userIds) ? userIds : [], createdBy: req.user?.userId });
            await record.save();
        } catch (persistErr) {
            console.error('Failed to persist announcement record', persistErr);
            // non-fatal — continue with sending notifications
        }
        const emailTemplate = buildAnnouncementEmail(title, message);

        const validTargetIds = Array.isArray(userIds)
            ? [...new Set(userIds.map((id) => String(id || '').trim()).filter(Boolean))]
            : [];

        if (validTargetIds.length) {
            const validUsers = await UserModel.find({ _id: { $in: validTargetIds }, isActive: { $ne: false }, email: { $exists: true, $ne: '' } }).select('email').lean();
            const recipients = validUsers.map((user) => user.email).filter(Boolean);
            if (recipients.length) {
                const chunkSize = 50;
                for (let idx = 0; idx < recipients.length; idx += chunkSize) {
                    const chunk = recipients.slice(idx, idx + chunkSize);
                    try {
                        await sendMail({ to: process.env.MAIL_USER, bcc: chunk, subject: emailTemplate.subject, text: emailTemplate.text, html: emailTemplate.html });
                    } catch (mailErr) {
                        console.error('Announcement email send failed for recipient chunk', { err: mailErr });
                        // continue sending socket notifications; do not fail the whole request
                    }
                }
            }
            const results = [];
            for (const uid of validTargetIds) {
                const n = await sendNotification(uid, payload);
                results.push(n);
            }
            return res.json({ success: true, count: results.length });
        }

        await sendNotification(null, payload);

        const allUsers = await UserModel.find({ isActive: { $ne: false }, email: { $exists: true, $ne: '' } }).select('email').lean();
        const recipients = [];
        for (const user of allUsers) {
            if (user.email) recipients.push(user.email);
            if (recipients.length >= 50) {
                await sendMail({ to: process.env.MAIL_USER, bcc: recipients, subject: emailTemplate.subject, text: emailTemplate.text, html: emailTemplate.html });
                recipients.length = 0;
            }
        }
        if (recipients.length) {
            try {
                await sendMail({ to: process.env.MAIL_USER, bcc: recipients, subject: emailTemplate.subject, text: emailTemplate.text, html: emailTemplate.html });
            } catch (mailErr) {
                console.error('Announcement email send failed for aggregated recipients', { err: mailErr });
            }
        }

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send announcement' });
    }
};

module.exports.listAnnouncements = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const filter = {};
        const [items, total] = await Promise.all([
            AnnouncementModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            AnnouncementModel.countDocuments(filter),
        ]);
        return res.json({ data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to list announcements' });
    }
};

module.exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params || {};
        if (!id) return res.status(400).json({ message: 'Announcement id is required' });
        await AnnouncementModel.deleteOne({ _id: id });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete announcement' });
    }
};
