const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function safeParseJson(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
    return value;
}

function normalizeAuditRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        user: row.user_id ? { id: row.user_id, name: row.user_name, email: row.user_email, role: row.user_role } : null,
        action: row.action,
        resource: row.resource,
        resourceId: row.resource_id,
        method: row.method,
        endpoint: row.endpoint,
        status: row.status,
        statusCode: row.status_code,
        errorMessage: row.error_message,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        metadata: safeParseJson(row.metadata),
        duration: row.duration,
        isAdmin: row.is_admin ?? false,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function normalizeDbValue(value) {
    return value === undefined ? null : value;
}

function mapColumnName(field) {
    if (!field) return null;
    const normalizedField = field.replace(/^\$/, "");
    const fieldMap = {
        "user.id": "user_id",
        "userId": "user_id",
        "resourceId": "resource_id",
        "statusCode": "status_code",
        "errorMessage": "error_message",
        "ipAddress": "ip_address",
        "userAgent": "user_agent",
        "isAdmin": "is_admin",
        "createdAt": "created_at",
        "updatedAt": "updated_at",
    };

    return fieldMap[normalizedField] || normalizedField;
}

function getValueByPath(source, path) {
    if (!source || !path) return undefined;
    const normalizedPath = path.replace(/^\$/, "");
    return normalizedPath.split(".").reduce((current, key) => current?.[key], source);
}

function buildWhereClause(filter = {}) {
    const conditions = [];
    const values = [];

    Object.entries(filter).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) return;

        if (typeof value === "object" && !(value instanceof Date)) {
            const operatorEntries = Object.entries(value);
            const hasOperators = operatorEntries.some(([operator]) => ["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(operator));

            if (hasOperators) {
                const column = mapColumnName(key);
                if (!column) return;

                operatorEntries.forEach(([operator, operand]) => {
                    if (["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(operator)) {
                        const sqlOperator = {
                            $eq: "=",
                            $gt: ">",
                            $gte: ">=",
                            $lt: "<",
                            $lte: "<=",
                            $ne: "!=",
                        }[operator];

                        if (sqlOperator) {
                            conditions.push(`${column} ${sqlOperator} ?`);
                            values.push(operand instanceof Date ? operand.toISOString() : operand);
                        }
                    }
                });
                return;
            }
        }

        const column = mapColumnName(key);
        if (!column) return;

        if (key === "isAdmin") {
            conditions.push(`${column} = ?`);
            values.push(value ? 1 : 0);
            return;
        }

        if (key === "createdAt" || key === "updatedAt") {
            conditions.push(`${column} = ?`);
            values.push(value instanceof Date ? value.toISOString() : value);
            return;
        }

        conditions.push(`${column} = ?`);
        values.push(value);
    });

    return { conditions, values };
}

function matchesFilter(row, filter = {}) {
    return Object.entries(filter).every(([key, value]) => {
        if (value === undefined || value === null) return true;

        if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
            const operatorEntries = Object.entries(value);
            const hasOperators = operatorEntries.some(([operator]) => ["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(operator));

            if (hasOperators) {
                return operatorEntries.every(([operator, operand]) => {
                    const actualValue = getValueByPath(row, key);
                    const comparable = operand instanceof Date ? operand : operand;
                    switch (operator) {
                        case "$eq": return actualValue === comparable;
                        case "$gt": return actualValue > comparable;
                        case "$gte": return actualValue >= comparable;
                        case "$lt": return actualValue < comparable;
                        case "$lte": return actualValue <= comparable;
                        case "$ne": return actualValue !== comparable;
                        default: return true;
                    }
                });
            }
        }

        if (key === "isAdmin") {
            return Boolean(getValueByPath(row, key)) === Boolean(value);
        }

        return getValueByPath(row, key) === value;
    });
}

function toDbAudit(item) {
    return {
        id: normalizeDbValue(item._id || item.id || randomUUID()),
        user_id: normalizeDbValue(item.user?.id ?? null),
        user_name: normalizeDbValue(item.user?.name ?? null),
        user_email: normalizeDbValue(item.user?.email ?? null),
        user_role: normalizeDbValue(item.user?.role ?? null),
        action: normalizeDbValue(item.action ?? null),
        resource: normalizeDbValue(item.resource ?? null),
        resource_id: normalizeDbValue(item.resourceId ?? null),
        method: normalizeDbValue(item.method ?? null),
        endpoint: normalizeDbValue(item.endpoint ?? null),
        status: normalizeDbValue(item.status || "SUCCESS"),
        status_code: normalizeDbValue(item.statusCode ?? null),
        error_message: normalizeDbValue(item.errorMessage ?? null),
        ip_address: normalizeDbValue(item.ipAddress ?? null),
        user_agent: normalizeDbValue(item.userAgent ?? null),
        metadata: normalizeDbValue(item.metadata ? JSON.stringify(item.metadata) : null),
        duration: normalizeDbValue(item.duration ?? null),
        is_admin: normalizeDbValue(item.isAdmin ? 1 : 0),
    };
}

class AuditLogModel {
    constructor(data = {}) {
        Object.assign(this, normalizeAuditRow(toDbAudit(data)));
    }

    async save() {
        const payload = toDbAudit(this);
        await query(
            `INSERT INTO audit_logs (id, user_id, user_name, user_email, user_role, action, resource, resource_id, method, endpoint, status, status_code, error_message, ip_address, user_agent, metadata, duration, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email), user_role = VALUES(user_role), action = VALUES(action), resource = VALUES(resource), resource_id = VALUES(resource_id), method = VALUES(method), endpoint = VALUES(endpoint), status = VALUES(status), status_code = VALUES(status_code), error_message = VALUES(error_message), ip_address = VALUES(ip_address), user_agent = VALUES(user_agent), metadata = VALUES(metadata), duration = VALUES(duration), is_admin = VALUES(is_admin), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.user_id, payload.user_name, payload.user_email, payload.user_role, payload.action, payload.resource, payload.resource_id, payload.method, payload.endpoint, payload.status, payload.status_code, payload.error_message, payload.ip_address, payload.user_agent, payload.metadata, payload.duration, payload.is_admin, new Date(), new Date()]
        );
        return this;
    }
}

AuditLogModel.find = function find(filter = {}) {
    return {
        filter,
        sortValue: {},
        skipValue: 0,
        limitValue: null,
        sort(sortSpec = {}) {
            this.sortValue = sortSpec;
            return this;
        },
        skip(amount = 0) {
            this.skipValue = Number(amount) || 0;
            return this;
        },
        limit(amount = null) {
            this.limitValue = amount === null ? null : Number(amount);
            return this;
        },
        async lean() {
            const { conditions, values } = buildWhereClause(this.filter);
            let sql = "SELECT * FROM audit_logs";

            if (conditions.length) {
                sql += ` WHERE ${conditions.join(" AND ")}`;
            }

            if (Object.keys(this.sortValue).length) {
                const sortClauses = Object.entries(this.sortValue).map(([field, direction]) => {
                    const column = mapColumnName(field);
                    return `${column || field} ${direction === -1 ? "DESC" : "ASC"}`;
                });
                sql += ` ORDER BY ${sortClauses.join(", ")}`;
            } else {
                sql += " ORDER BY created_at DESC";
            }

            if (this.limitValue !== null && Number.isFinite(this.limitValue)) {
                sql += ` LIMIT ${this.limitValue}`;
            }

            if (this.skipValue > 0) {
                sql += ` OFFSET ${this.skipValue}`;
            }

            const rows = await query(sql, values);
            return rows.map(normalizeAuditRow);
        },
    };
};

AuditLogModel.countDocuments = async function countDocuments(filter = {}) {
    const { conditions, values } = buildWhereClause(filter);
    let sql = "SELECT COUNT(*) AS count FROM audit_logs";

    if (conditions.length) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const rows = await query(sql, values);
    return Number(rows[0]?.count || 0);
};

AuditLogModel.distinct = async function distinct(field, filter = {}) {
    const rows = await AuditLogModel.find(filter).lean();
    return rows
        .map((row) => getValueByPath(row, field))
        .filter((value) => value !== undefined && value !== null);
};

AuditLogModel.aggregate = async function aggregate(pipeline = []) {
    let rows = await AuditLogModel.find({}).lean();

    for (const stage of pipeline) {
        if (stage.$match) {
            rows = rows.filter((row) => matchesFilter(row, stage.$match));
        }

        if (stage.$group) {
            const groups = new Map();
            const groupField = stage._id && typeof stage._id === "string" ? stage._id.replace(/^\$/, "") : null;

            rows.forEach((row) => {
                const key = groupField ? getValueByPath(row, groupField) : null;
                if (!groups.has(key)) {
                    groups.set(key, {
                        _id: key,
                        count: 0,
                        lastError: null,
                    });
                }

                const group = groups.get(key);
                group.count += 1;

                if (stage.lastError && stage.lastError.$max) {
                    const currentValue = getValueByPath(row, "createdAt");
                    if (!group.lastError || currentValue > group.lastError) {
                        group.lastError = currentValue;
                    }
                }
            });

            rows = Array.from(groups.values());
        }

        if (stage.$sort) {
            rows.sort((left, right) => {
                for (const [field, direction] of Object.entries(stage.$sort)) {
                    const leftValue = getValueByPath(left, field);
                    const rightValue = getValueByPath(right, field);
                    if (leftValue === rightValue) continue;
                    if (leftValue === undefined || leftValue === null) return 1;
                    if (rightValue === undefined || rightValue === null) return -1;
                    return direction === -1 ? (leftValue > rightValue ? -1 : 1) : (leftValue > rightValue ? 1 : -1);
                }
                return 0;
            });
        }
    }

    return rows;
};

AuditLogModel.create = async function create(data = {}) {
    const item = new AuditLogModel(data);
    await item.save();
    return item;
};

module.exports = AuditLogModel;
