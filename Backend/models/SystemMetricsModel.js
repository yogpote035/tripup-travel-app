const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function normalizeMetricsRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        timestamp: row.timestamp ? new Date(row.timestamp) : null,
        server: row.server ? JSON.parse(row.server) : {},
        database: row.database ? JSON.parse(row.database) : {},
        api: row.api ? JSON.parse(row.api) : {},
        errors: row.errors ? JSON.parse(row.errors) : [],
        storage: row.storage ? JSON.parse(row.storage) : {},
    };
}

function toDbMetrics(item) {
    return {
        id: item._id || item.id || randomUUID(),
        timestamp: item.timestamp || new Date(),
        server: item.server ? JSON.stringify(item.server) : JSON.stringify({}),
        database: item.database ? JSON.stringify(item.database) : JSON.stringify({}),
        api: item.api ? JSON.stringify(item.api) : JSON.stringify({}),
        errors: item.errors ? JSON.stringify(item.errors) : JSON.stringify([]),
        storage: item.storage ? JSON.stringify(item.storage) : JSON.stringify({}),
    };
}

class SystemMetricsModel {
    constructor(data = {}) {
        Object.assign(this, normalizeMetricsRow(toDbMetrics(data)));
    }

    async save() {
        const payload = toDbMetrics(this);
        await query(
            'INSERT INTO system_metrics (id, timestamp, server, `database`, api, errors, storage, created_at, updated_at)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n       ON DUPLICATE KEY UPDATE timestamp = VALUES(timestamp), server = VALUES(server), `database` = VALUES(`database`), api = VALUES(api), errors = VALUES(errors), storage = VALUES(storage), updated_at = CURRENT_TIMESTAMP',
            [payload.id, payload.timestamp, payload.server, payload.database, payload.api, payload.errors, payload.storage, new Date(), new Date()]
        );
        return this;
    }
}

SystemMetricsModel.create = async function create(data = {}) {
    const item = new SystemMetricsModel(data);
    await item.save();
    return item;
};

module.exports = SystemMetricsModel;
