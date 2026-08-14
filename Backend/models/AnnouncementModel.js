const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function normalizeAnnouncementRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        title: row.title,
        message: row.message,
        meta: row.meta ? JSON.parse(row.meta) : null,
        userIds: [],
        createdBy: row.created_by,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function toDbAnnouncement(item) {
    return {
        id: item._id || item.id || randomUUID(),
        title: item.title,
        message: item.message,
        meta: item.meta ? JSON.stringify(item.meta) : null,
        created_by: item.createdBy,
    };
}

class AnnouncementModel {
    constructor(data = {}) {
        Object.assign(this, normalizeAnnouncementRow(toDbAnnouncement(data)));
    }

    async save() {
        const payload = toDbAnnouncement(this);
        await query(
            `INSERT INTO announcements (id, title, message, meta, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), message = VALUES(message), meta = VALUES(meta), created_by = VALUES(created_by), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.title, payload.message, payload.meta, payload.created_by, new Date(), new Date()]
        );
        return this;
    }
}

AnnouncementModel.find = function find(filter = {}) {
    const values = [];
    let sql = "SELECT * FROM announcements";
    const conditions = [];

    if (filter.title) {
        conditions.push("title LIKE ?");
        values.push(`%${String(filter.title).replace(/([%_])/g, "\\$1")}%`);
    }

    if (filter.message) {
        conditions.push("message LIKE ?");
        values.push(`%${String(filter.message).replace(/([%_])/g, "\\$1")}%`);
    }

    if (conditions.length) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    sql += " ORDER BY created_at DESC";

    return {
        sort() { return this; },
        skip() { return this; },
        limit() { return this; },
        lean: async () => {
            const rows = await query(sql, values);
            return rows.map(normalizeAnnouncementRow);
        },
    };
};

AnnouncementModel.countDocuments = async function countDocuments(filter = {}) {
    const values = [];
    let sql = "SELECT COUNT(*) AS count FROM announcements";
    const conditions = [];

    if (filter.title) {
        conditions.push("title LIKE ?");
        values.push(`%${String(filter.title).replace(/([%_])/g, "\\$1")}%`);
    }

    if (filter.message) {
        conditions.push("message LIKE ?");
        values.push(`%${String(filter.message).replace(/([%_])/g, "\\$1")}%`);
    }

    if (conditions.length) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const rows = await query(sql, values);
    return Number(rows[0].count || 0);
};

AnnouncementModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM announcements WHERE id = ? LIMIT 1", [id]);
    return normalizeAnnouncementRow(rows[0]);
};

AnnouncementModel.create = async function create(data = {}) {
    const item = new AnnouncementModel(data);
    await item.save();
    return item;
};

AnnouncementModel.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await AnnouncementModel.findById(id);
    if (!existing) return null;
    await query("DELETE FROM announcements WHERE id = ?", [id]);
    return existing;
};

module.exports = AnnouncementModel;
