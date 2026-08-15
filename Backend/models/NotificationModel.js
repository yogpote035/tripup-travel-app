const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function safeJsonParse(value, fallback = null) {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }
    if (typeof value === "object") {
        if (Buffer.isBuffer(value)) {
            try {
                return JSON.parse(value.toString("utf8"));
            } catch (error) {
                return fallback;
            }
        }
        return value;
    }
    return value;
}

function normalizeNotificationRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        user: row.user_id || row.user,
        type: row.type,
        title: row.title,
        message: row.message,
        meta: safeJsonParse(row.meta, null),
        read: row.is_read ?? row.read ?? false,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function toDbNotification(item) {
    return {
        id: item._id || item.id || randomUUID(),
        user_id: item.user,
        type: item.type,
        title: item.title,
        message: item.message,
        meta: item.meta ? JSON.stringify(item.meta) : null,
        is_read: item.read ?? item.isRead ?? false,
    };
}

function buildWhereClause(filter = {}) {
    const columnMap = { _id: "id", id: "id", user: "user_id", userId: "user_id", read: "is_read", isRead: "is_read", createdAt: "created_at", updatedAt: "updated_at" };
    const conditions = [];
    const values = [];

    Object.entries(filter).forEach(([field, rawValue]) => {
        if (rawValue === undefined || rawValue === null) return;
        const column = columnMap[field] || field;
        const normalise = (value) => column === "is_read" && typeof value === "boolean" ? (value ? 1 : 0) : value;

        if (rawValue && typeof rawValue === "object" && !(rawValue instanceof Date) && !Array.isArray(rawValue)) {
            Object.entries(rawValue).forEach(([operator, value]) => {
                const operators = { $gt: ">", $gte: ">=", $lt: "<", $lte: "<=", $ne: "!=" };
                if (operators[operator]) {
                    conditions.push(`${column} ${operators[operator]} ?`);
                    values.push(normalise(value));
                }
            });
            return;
        }
        conditions.push(`${column} = ?`);
        values.push(normalise(rawValue));
    });

    return { conditions, values };
}

class NotificationModel {
    constructor(data = {}) {
        Object.assign(this, normalizeNotificationRow(toDbNotification(data)));
    }

    async save() {
        const payload = toDbNotification(this);
        await query(
            `INSERT INTO notifications (id, user_id, type, title, message, meta, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id), type = VALUES(type), title = VALUES(title), message = VALUES(message), meta = VALUES(meta), is_read = VALUES(is_read), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.user_id, payload.type, payload.title, payload.message, payload.meta, payload.is_read ? 1 : 0, new Date(), new Date()]
        );
        return this;
    }
}

NotificationModel.find = function find(filter = {}) {
    return {
        sort() { return this; },
        skip() { return this; },
        limit() { return this; },
        lean: async () => {
            let sql = "SELECT * FROM notifications";
            const values = [];
            if (filter.user) { sql += " WHERE user_id = ?"; values.push(filter.user); }
            if (filter.read !== undefined) {
                sql += filter.user ? " AND is_read = ?" : " WHERE is_read = ?";
                values.push(filter.read ? 1 : 0);
            }
            sql += " ORDER BY created_at DESC";
            const rows = await query(sql, values);
            return rows.map(normalizeNotificationRow);
        },
    };
};

NotificationModel.findOne = async function findOne(filter = {}) {
    const conditions = [];
    const values = [];

    if (filter._id || filter.id) {
        conditions.push("id = ?");
        values.push(filter._id || filter.id);
    }

    if (filter.user) {
        conditions.push("user_id = ?");
        values.push(filter.user);
    }

    if (filter.read !== undefined) {
        conditions.push("is_read = ?");
        values.push(filter.read ? 1 : 0);
    }

    if (conditions.length === 0) return null;
    const rows = await query(`SELECT * FROM notifications WHERE ${conditions.join(" AND ")} LIMIT 1`, values);
    return normalizeNotificationRow(rows[0]);
};

NotificationModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM notifications WHERE id = ? LIMIT 1", [id]);
    return normalizeNotificationRow(rows[0]);
};

NotificationModel.countDocuments = async function countDocuments(filter = {}) {
    let sql = "SELECT COUNT(*) AS count FROM notifications";
    const values = [];
    if (filter.user) { sql += " WHERE user_id = ?"; values.push(filter.user); }
    if (filter.read !== undefined) {
        sql += filter.user ? " AND is_read = ?" : " WHERE is_read = ?";
        values.push(filter.read ? 1 : 0);
    }
    const rows = await query(sql, values);
    return Number(rows[0].count || 0);
};

NotificationModel.create = async function create(data = {}) {
    const item = new NotificationModel(data);
    await item.save();
    return item;
};

NotificationModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
    const payload = update.$set || update;
    const fields = [];
    const values = [];
    if (payload.read !== undefined) { fields.push("is_read = ?"); values.push(payload.read ? 1 : 0); }
    if (payload.title !== undefined) { fields.push("title = ?"); values.push(payload.title); }
    if (payload.message !== undefined) { fields.push("message = ?"); values.push(payload.message); }
    if (payload.meta !== undefined) { fields.push("meta = ?"); values.push(payload.meta ? JSON.stringify(payload.meta) : null); }
    if (fields.length === 0) return NotificationModel.findById(id);
    values.push(id);
    await query(`UPDATE notifications SET ${fields.join(", ")} WHERE id = ?`, values);
    return NotificationModel.findById(id);
};

NotificationModel.updateOne = async function updateOne(filter = {}, update = {}) {
    const target = await NotificationModel.findOne(filter);
    if (!target) return null;
    return NotificationModel.findByIdAndUpdate(target.id || target._id, update);
};

NotificationModel.updateMany = async function updateMany(filter = {}, update = {}) {
    const rows = await query(
        `SELECT id FROM notifications WHERE ${Object.entries(filter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
                if (key === "user" || key === "userId") return "user_id = ?";
                if (key === "read" || key === "isRead") return "is_read = ?";
                if (key === "_id" || key === "id") return "id = ?";
                return `${key} = ?`;
            })
            .join(" AND ") || "1 = 1"}`,
        Object.entries(filter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
                if (key === "user" || key === "userId") return value;
                if (key === "read" || key === "isRead") return value ? 1 : 0;
                return value;
            })
    );

    const ids = rows.map((row) => row.id);
    for (const id of ids) {
        await NotificationModel.findByIdAndUpdate(id, update);
    }
    return ids;
};

NotificationModel.deleteMany = async function deleteMany(filter = {}) {
    const rows = await query(
        `SELECT id FROM notifications WHERE ${Object.entries(filter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
                if (key === "user" || key === "userId") return "user_id = ?";
                if (key === "read" || key === "isRead") return "is_read = ?";
                if (key === "_id" || key === "id") return "id = ?";
                return `${key} = ?`;
            })
            .join(" AND ") || "1 = 1"}`,
        Object.entries(filter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
                if (key === "user" || key === "userId") return value;
                if (key === "read" || key === "isRead") return value ? 1 : 0;
                return value;
            })
    );

    const ids = rows.map((row) => row.id);
    for (const id of ids) {
        await query("DELETE FROM notifications WHERE id = ?", [id]);
    }
    return { deletedCount: ids.length };
};

NotificationModel.__test__ = { buildWhereClause };

module.exports = NotificationModel;
