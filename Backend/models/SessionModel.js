const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function normalizeSessionRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    userId: row.user_id || row.userId,
    refreshTokenHash: row.refresh_token_hash || row.refreshTokenHash,
    familyId: row.family_id || row.familyId,
    userAgent: row.user_agent || row.userAgent,
    ipAddress: row.ip_address || row.ipAddress,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    isRevoked: row.is_revoked ?? row.isRevoked ?? false,
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    revokeReason: row.revoke_reason || row.revokeReason || null,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbSession(session) {
  return {
    id: session._id || session.id || randomUUID(),
    user_id: session.userId,
    refresh_token_hash: session.refreshTokenHash,
    family_id: session.familyId,
    user_agent: session.userAgent,
    ip_address: session.ipAddress,
    expires_at: session.expiresAt ? new Date(session.expiresAt) : new Date(),
    is_revoked: session.isRevoked ?? false,
    revoked_at: session.revokedAt ? new Date(session.revokedAt) : null,
    revoke_reason: session.revokeReason || null,
    last_used_at: session.lastUsedAt ? new Date(session.lastUsedAt) : new Date(),
  };
}

function mapFieldName(key) {
  switch (key) {
    case "_id":
    case "id":
      return "id";
    case "userId":
    case "user_id":
      return "user_id";
    case "familyId":
    case "family_id":
      return "family_id";
    case "refreshTokenHash":
    case "refresh_token_hash":
      return "refresh_token_hash";
    case "userAgent":
    case "user_agent":
      return "user_agent";
    case "ipAddress":
    case "ip_address":
      return "ip_address";
    case "expiresAt":
    case "expires_at":
      return "expires_at";
    case "isRevoked":
    case "is_revoked":
      return "is_revoked";
    case "revokedAt":
    case "revoked_at":
      return "revoked_at";
    case "revokeReason":
    case "revoke_reason":
      return "revoke_reason";
    case "lastUsedAt":
    case "last_used_at":
      return "last_used_at";
    case "createdAt":
    case "created_at":
      return "created_at";
    case "updatedAt":
    case "updated_at":
      return "updated_at";
    default:
      return key;
  }
}

function normalizeFilterValue(fieldName, value) {
  if ((fieldName === "is_revoked" || fieldName === "is_read") && typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (fieldName === "expires_at" && value instanceof Date) {
    return new Date(value);
  }
  return value;
}

function buildWhereClause(filter = {}) {
  const conditions = [];
  const values = [];

  const addCondition = (fieldName, operator, rawValue, options = {}) => {
    const dbField = mapFieldName(fieldName);
    const value = normalizeFilterValue(dbField, rawValue);

    if (operator === "$ne") {
      conditions.push(`${dbField} != ?`);
      values.push(value);
      return;
    }

    if (operator === "$gt") {
      conditions.push(`${dbField} > ?`);
      values.push(value);
      return;
    }

    if (operator === "$gte") {
      conditions.push(`${dbField} >= ?`);
      values.push(value);
      return;
    }

    if (operator === "$lt") {
      conditions.push(`${dbField} < ?`);
      values.push(value);
      return;
    }

    if (operator === "$lte") {
      conditions.push(`${dbField} <= ?`);
      values.push(value);
      return;
    }

    if (operator === "$in") {
      if (!Array.isArray(value) || value.length === 0) {
        conditions.push("1 = 0");
        return;
      }
      const placeholders = value.map(() => "?").join(", ");
      conditions.push(`${dbField} IN (${placeholders})`);
      values.push(...value.map((item) => normalizeFilterValue(dbField, item)));
      return;
    }

    if (operator === "$exists") {
      conditions.push(value ? `${dbField} IS NOT NULL` : `${dbField} IS NULL`);
      return;
    }

    if (operator === "$regex") {
      const regexValue = value instanceof RegExp ? value.source : String(value);
      const isCaseInsensitive = (value instanceof RegExp && value.flags?.includes("i")) || String(options.$options || "").includes("i");
      const pattern = isCaseInsensitive ? regexValue.toLowerCase() : regexValue;
      conditions.push(isCaseInsensitive ? `LOWER(${dbField}) REGEXP ?` : `${dbField} REGEXP ?`);
      values.push(pattern);
      return;
    }

    conditions.push(`${dbField} = ?`);
    values.push(value);
  };

  const walk = (currentFilter) => {
    if (!currentFilter || typeof currentFilter !== "object") return;
    if (Array.isArray(currentFilter)) return;

    Object.entries(currentFilter).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "$or") {
        if (!Array.isArray(value) || value.length === 0) return;
        const orClauses = value
          .map((subFilter) => {
            const { conditions: subConditions, values: subValues } = buildWhereClause(subFilter);
            if (subConditions.length === 0) return null;
            return { conditions: subConditions, values: subValues };
          })
          .filter(Boolean);

        if (orClauses.length > 0) {
          const clauseSql = orClauses.map(({ conditions: subConditions }) => `(${subConditions.join(" AND ")})`).join(" OR ");
          conditions.push(`(${clauseSql})`);
          orClauses.forEach(({ values: subValues }) => values.push(...subValues));
        }
        return;
      }

      if (value instanceof RegExp) {
        addCondition(key, "$regex", value, {});
        return;
      }

      if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).some((operator) => operator.startsWith("$"))) {
        if (value.$regex !== undefined) {
          addCondition(key, "$regex", value.$regex, value);
          return;
        }
        Object.entries(value).forEach(([operator, operatorValue]) => {
          if (operator.startsWith("$")) addCondition(key, operator, operatorValue, value);
        });
        return;
      }

      addCondition(key, "$eq", value);
    });
  };

  walk(filter);
  return { conditions, values };
}

class SessionModel {
  constructor(data = {}) {
    Object.assign(this, normalizeSessionRow(toDbSession(data)));
    if (!this._id) this._id = randomUUID();
    if (!this.id) this.id = this._id;
  }

  async save() {
    const payload = toDbSession(this);
    await query(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, family_id, user_agent, ip_address, expires_at, is_revoked, revoked_at, revoke_reason, last_used_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         refresh_token_hash = VALUES(refresh_token_hash),
         family_id = VALUES(family_id),
         user_agent = VALUES(user_agent),
         ip_address = VALUES(ip_address),
         expires_at = VALUES(expires_at),
         is_revoked = VALUES(is_revoked),
         revoked_at = VALUES(revoked_at),
         revoke_reason = VALUES(revoke_reason),
         last_used_at = VALUES(last_used_at),
         updated_at = CURRENT_TIMESTAMP`,
      [
        payload.id,
        payload.user_id,
        payload.refresh_token_hash,
        payload.family_id,
        payload.user_agent,
        payload.ip_address,
        payload.expires_at,
        payload.is_revoked ? 1 : 0,
        payload.revoked_at,
        payload.revoke_reason,
        payload.last_used_at,
        new Date(),
        new Date(),
      ]
    );
    return this;
  }
}

SessionModel.findOne = async function findOne(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  if (conditions.length === 0) return null;
  const rows = await query(`SELECT * FROM sessions WHERE ${conditions.join(" AND ")} LIMIT 1`, values);
  const record = normalizeSessionRow(rows[0]);
  if (!record) return null;
  return {
    ...record,
    lean: () => ({ ...record }),
  };
};

SessionModel.findById = async function findById(id) {
  return SessionModel.findOne({ _id: id });
};

SessionModel.find = function find(filter = {}) {
  return {
    select() { return this; },
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => {
      const { conditions, values } = buildWhereClause(filter);
      if (conditions.length === 0) return [];
      const rows = await query(`SELECT * FROM sessions WHERE ${conditions.join(" AND ")}`, values);
      return rows.map(normalizeSessionRow);
    },
  };
};

SessionModel.__test__ = { buildWhereClause };

SessionModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
  const payload = update.$set || update;
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "isRevoked" || key === "is_revoked") {
      fields.push("is_revoked = ?"); values.push(value ? 1 : 0);
    } else if (key === "revokedAt" || key === "revoked_at") {
      fields.push("revoked_at = ?"); values.push(value ? new Date(value) : null);
    } else if (key === "revokeReason" || key === "revoke_reason") {
      fields.push("revoke_reason = ?"); values.push(value);
    } else if (key === "lastUsedAt" || key === "last_used_at") {
      fields.push("last_used_at = ?"); values.push(value ? new Date(value) : null);
    } else if (key === "userId" || key === "user_id") {
      fields.push("user_id = ?"); values.push(value);
    } else if (key === "refreshTokenHash" || key === "refresh_token_hash") {
      fields.push("refresh_token_hash = ?"); values.push(value);
    } else if (key === "familyId" || key === "family_id") {
      fields.push("family_id = ?"); values.push(value);
    } else if (key === "userAgent" || key === "user_agent") {
      fields.push("user_agent = ?"); values.push(value);
    } else if (key === "ipAddress" || key === "ip_address") {
      fields.push("ip_address = ?"); values.push(value);
    } else if (key === "expiresAt" || key === "expires_at") {
      fields.push("expires_at = ?"); values.push(value ? new Date(value) : new Date());
    }
  });
  if (fields.length === 0) return SessionModel.findById(id);
  values.push(id);
  await query(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`, values);
  return SessionModel.findById(id);
};

SessionModel.findOneAndUpdate = async function findOneAndUpdate(filter = {}, update = {}) {
  const existing = await SessionModel.findOne(filter);
  if (!existing) return null;
  return SessionModel.findByIdAndUpdate(existing._id, update);
};

SessionModel.updateMany = async function updateMany(filter = {}, update = {}) {
  const rows = await query(`SELECT id FROM sessions WHERE ${buildWhereClause(filter).conditions.join(" AND ")}`, buildWhereClause(filter).values);
  for (const row of rows) {
    await SessionModel.findByIdAndUpdate(row.id, update);
  }
  return rows.map((row) => row.id);
};

SessionModel.findByIdAndDelete = async function findByIdAndDelete(id) {
  const existing = await SessionModel.findById(id);
  if (!existing) return null;
  await query("DELETE FROM sessions WHERE id = ?", [id]);
  return existing;
};

SessionModel.create = async function create(data = {}) {
  const session = new SessionModel(data);
  await session.save();
  return session;
};

module.exports = SessionModel;
