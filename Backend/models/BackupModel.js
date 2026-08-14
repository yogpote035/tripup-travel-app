const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function safeParseJson(value, defaultValue) {
    if (value === undefined || value === null || value === "") return defaultValue;
    try {
        return JSON.parse(value);
    } catch (error) {
        return defaultValue;
    }
}

function normalizeBackupRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        backupName: row.backup_name || row.backupName,
        backupType: row.backup_type || row.backupType || "MANUAL",
        size: row.size || 0,
        collections: safeParseJson(row.collections, []),
        createdBy: safeParseJson(row.created_by, null),
        description: row.description,
        status: row.status || "IN_PROGRESS",
        backupPath: row.backup_path || row.backupPath,
        duration: row.duration || 0,
        errorMessage: row.error_message || row.errorMessage,
        isRestored: row.is_restored ?? row.isRestored ?? false,
        restoredAt: row.restored_at ? new Date(row.restored_at) : null,
        restoredBy: safeParseJson(row.restored_by, null),
        retention: row.retention ? new Date(row.retention) : null,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function toDbBackup(item) {
    return {
        id: item._id || item.id || randomUUID(),
        backup_name: item.backupName ?? null,
        backup_type: item.backupType || "MANUAL",
        size: item.size || 0,
        collections: item.collections ? JSON.stringify(item.collections) : JSON.stringify([]),
        created_by: item.createdBy ? JSON.stringify(item.createdBy) : JSON.stringify({}),
        description: item.description ?? null,
        status: item.status || "IN_PROGRESS",
        backup_path: item.backupPath ?? null,
        duration: item.duration || 0,
        error_message: item.errorMessage ?? null,
        is_restored: item.isRestored ? 1 : 0,
        restored_at: item.restoredAt ?? null,
        restored_by: item.restoredBy ? JSON.stringify(item.restoredBy) : JSON.stringify({}),
        retention: item.retention ?? null,
    };
}

class BackupModel {
    constructor(data = {}) {
        Object.assign(this, normalizeBackupRow(toDbBackup(data)));
    }

    async save() {
        const payload = toDbBackup(this);
        await query(
            `INSERT INTO backups (id, backup_name, backup_type, size, collections, created_by, description, status, backup_path, duration, error_message, is_restored, restored_at, restored_by, retention, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE backup_name = VALUES(backup_name), backup_type = VALUES(backup_type), size = VALUES(size), collections = VALUES(collections), created_by = VALUES(created_by), description = VALUES(description), status = VALUES(status), backup_path = VALUES(backup_path), duration = VALUES(duration), error_message = VALUES(error_message), is_restored = VALUES(is_restored), restored_at = VALUES(restored_at), restored_by = VALUES(restored_by), retention = VALUES(retention), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.backup_name, payload.backup_type, payload.size, payload.collections, payload.created_by, payload.description, payload.status, payload.backup_path, payload.duration, payload.error_message, payload.is_restored, payload.restored_at, payload.restored_by, payload.retention, new Date(), new Date()]
        );
        return this;
    }

    async deleteOne() {
        return BackupModel.findByIdAndDelete(this._id);
    }
}

function buildWhereClause(filter = {}) {
    const conditions = [];
    const values = [];
    const entries = Object.entries(filter || {});
    for (const [key, value] of entries) {
        if (key === "$or") continue;
        if (value === undefined || value === null) continue;
        if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
            if (value.$regex) {
                conditions.push(`${key} LIKE ?`);
                values.push(`%${String(value.$regex).replace(/([%_])/g, "\\$1")}%`);
            } else if (value.$in) {
                const placeholders = value.$in.map(() => "?").join(",");
                conditions.push(`${key} IN (${placeholders})`);
                values.push(...value.$in);
            } else if (value.$lt) {
                conditions.push(`${key} < ?`);
                values.push(value.$lt);
            } else if (value.$gt) {
                conditions.push(`${key} > ?`);
                values.push(value.$gt);
            } else {
                conditions.push(`${key} = ?`);
                values.push(value);
            }
        } else {
            conditions.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (filter.$or && Array.isArray(filter.$or)) {
        const grouped = filter.$or.map((entry) => {
            const inner = buildWhereClause(entry);
            return inner.conditions.length ? `(${inner.conditions.join(" AND ")})` : "(1=1)";
        });
        if (grouped.length) {
            conditions.push(`(${grouped.join(" OR ")})`);
            values.push(...filter.$or.flatMap((entry) => buildWhereClause(entry).values));
        }
    }

    return { conditions, values };
}

function mapBackupSortKey(key) {
    switch (key) {
        case "createdAt":
            return "created_at";
        case "updatedAt":
            return "updated_at";
        case "backupName":
            return "backup_name";
        case "backupType":
            return "backup_type";
        default:
            return key;
    }
}

BackupModel.find = function find(filter = {}) {
    const builder = {
        filter,
        options: {},
        select() { return this; },
        populate() { return this; },
        sort(sortValue) { this.options.sort = sortValue; return this; },
        skip(value) { this.options.skip = Number(value) || 0; return this; },
        limit(value) { this.options.limit = Number(value) || 0; return this; },
        async lean() { return BackupModel._findMany(this.filter, this.options); },
        async exec() { return BackupModel._findMany(this.filter, this.options); },
    };
    return builder;
};

BackupModel._findMany = async function _findMany(filter = {}, options = {}) {
    const { conditions, values } = buildWhereClause(filter);
    let sql = "SELECT * FROM backups";
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    if (options.sort) {
        const sortEntries = Object.entries(options.sort);
        if (sortEntries.length) {
            const order = sortEntries
                .map(([key, direction]) => `${mapBackupSortKey(key)} ${direction === -1 ? "DESC" : "ASC"}`)
                .join(", ");
            sql += ` ORDER BY ${order}`;
        }
    }
    if (options.skip) sql += ` LIMIT ${Number(options.skip)}, ${options.limit || 100}`;
    else if (options.limit) sql += ` LIMIT ${Number(options.limit)}`;
    const rows = await query(sql, values);
    return rows.map(normalizeBackupRow);
};

BackupModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM backups WHERE id = ? LIMIT 1", [id]);
    return wrapDocument(normalizeBackupRow(rows[0]));
};

BackupModel.findOne = async function findOne(filter = {}) {
    const { conditions, values } = buildWhereClause(filter);
    const rows = await query(`SELECT * FROM backups WHERE ${conditions.join(" AND ")} LIMIT 1`, values);
    return wrapDocument(normalizeBackupRow(rows[0]));
};

BackupModel.countDocuments = async function countDocuments(filter = {}) {
    const { conditions, values } = buildWhereClause(filter);
    const rows = await query(conditions.length ? `SELECT COUNT(*) AS count FROM backups WHERE ${conditions.join(" AND ")}` : "SELECT COUNT(*) AS count FROM backups", values);
    return Number(rows[0].count || 0);
};

BackupModel.create = async function create(data = {}) {
    const item = new BackupModel(data);
    await item.save();
    return item;
};

BackupModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
    const payload = update.$set || update;
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(payload)) {
        if (key === "_id" || key === "id") continue;
        if (key === "createdBy") { fields.push("created_by = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify({})); }
        else if (key === "backupPath") { fields.push("backup_path = ?"); values.push(value); }
        else if (key === "backupName") { fields.push("backup_name = ?"); values.push(value); }
        else if (key === "backupType") { fields.push("backup_type = ?"); values.push(value); }
        else if (key === "errorMessage") { fields.push("error_message = ?"); values.push(value); }
        else if (key === "isRestored") { fields.push("is_restored = ?"); values.push(value ? 1 : 0); }
        else if (key === "restoredAt") { fields.push("restored_at = ?"); values.push(value); }
        else if (key === "restoredBy") { fields.push("restored_by = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify({})); }
        else if (key === "collections") { fields.push("collections = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
        else if (key === "status") { fields.push("status = ?"); values.push(value); }
        else if (key === "size") { fields.push("size = ?"); values.push(value); }
        else if (key === "duration") { fields.push("duration = ?"); values.push(value); }
        else if (key === "retention") { fields.push("retention = ?"); values.push(value); }
        else if (key === "description") { fields.push("description = ?"); values.push(value); }
    }
    if (fields.length === 0) return BackupModel.findById(id);
    values.push(id);
    await query(`UPDATE backups SET ${fields.join(", ")} WHERE id = ?`, values);
    return BackupModel.findById(id);
};

BackupModel.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await BackupModel.findById(id);
    if (!existing) return null;
    await query("DELETE FROM backups WHERE id = ?", [id]);
    return existing;
};

module.exports = BackupModel;
