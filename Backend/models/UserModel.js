const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function normalizeUserRow(row) {
  if (!row) return null;
  let followers = [];
  try {
    if (row.followers) {
      followers = typeof row.followers === "string" ? JSON.parse(row.followers) : row.followers;
      if (!Array.isArray(followers)) followers = [];
    }
  } catch (err) {
    followers = [];
  }

  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    role: row.role || "user",
    isActive: row.is_active ?? row.isActive ?? true,
    is_active: row.is_active ?? row.isActive ?? true,
    profileImage: row.profile_image || row.profileImage || "",
    profile_image: row.profile_image || row.profileImage || "",
    followers,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    created_at: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    updated_at: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbUser(user) {
  const payload = {
    id: user._id || user.id || randomUUID(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: user.password,
    role: user.role || "user",
    is_active: user.isActive ?? user.is_active ?? true,
    profile_image: user.profileImage || user.profile_image || "",
    followers: user.followers ? JSON.stringify(user.followers) : JSON.stringify([]),
  };
  if (user.createdAt) payload.created_at = new Date(user.createdAt);
  if (user.updatedAt) payload.updated_at = new Date(user.updatedAt);
  return payload;
}

function mapFieldName(key) {
  switch (key) {
    case "_id":
    case "id":
      return "id";
    case "isActive":
    case "is_active":
      return "is_active";
    case "profileImage":
    case "profile_image":
      return "profile_image";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    case "followers":
      return "followers";
    default:
      return key;
  }
}

function normalizeFilterValue(fieldName, value) {
  if (fieldName === "is_active" && typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return value;
}

function buildWhereClause(filter = {}) {
  const conditions = [];
  const values = [];

  const addCondition = (fieldName, operator, rawValue, options = {}) => {
    const dbField = mapFieldName(fieldName);
    const value = normalizeFilterValue(dbField, rawValue);

    if (dbField === "followers") {
      if (operator === "$ne") {
        conditions.push(`NOT JSON_CONTAINS(followers, JSON_QUOTE(?), '$')`);
        values.push(value);
        return;
      }
      conditions.push(`JSON_CONTAINS(followers, JSON_QUOTE(?), '$')`);
      values.push(value);
      return;
    }

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
      if (value) {
        conditions.push(`${dbField} IS NOT NULL`);
      } else {
        conditions.push(`${dbField} IS NULL`);
      }
      return;
    }

    if (operator === "$regex") {
      const regexValue = value instanceof RegExp ? value.source : String(value);
      const isCaseInsensitive =
        (rawValue instanceof RegExp && rawValue.flags?.includes("i")) ||
        String(options.$options || "").includes("i");
      const pattern = isCaseInsensitive ? regexValue.toLowerCase() : regexValue;
      const expr = isCaseInsensitive ? `LOWER(${dbField}) REGEXP ?` : `${dbField} REGEXP ?`;
      conditions.push(expr);
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
          if (operator.startsWith("$")) {
            addCondition(key, operator, operatorValue, value);
          }
        });
        return;
      }

      addCondition(key, "$eq", value);
    });
  };

  walk(filter);
  return { conditions, values };
}

class UserModel {
  constructor(data = {}) {
    Object.assign(this, normalizeUserRow(toDbUser(data)));
    if (!this._id) this._id = randomUUID();
    if (!this.id) this.id = this._id;
  }

  async save() {
    const payload = toDbUser(this);
    await query(
      `INSERT INTO users (id, name, email, phone, password, role, is_active, profile_image, followers, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         phone = VALUES(phone),
         password = VALUES(password),
         role = VALUES(role),
         is_active = VALUES(is_active),
         profile_image = VALUES(profile_image),
         followers = VALUES(followers),
         updated_at = CURRENT_TIMESTAMP`,
      [
        payload.id,
        payload.name,
        payload.email,
        payload.phone,
        payload.password,
        payload.role,
        payload.is_active ? 1 : 0,
        payload.profile_image,
        payload.followers,
        payload.created_at || new Date(),
        payload.updated_at || new Date(),
      ]
    );
    return this;
  }

  toObject() {
    return normalizeUserRow(toDbUser(this));
  }
}

function applyProjection(record, selectedFields) {
  if (!selectedFields) return record;

  const fields = Array.isArray(selectedFields)
    ? selectedFields
    : String(selectedFields).split(/\s+/).filter(Boolean);

  const includeFields = fields.filter((field) => !field.startsWith("-"));
  const excludeFields = new Set(fields.filter((field) => field.startsWith("-")).map((field) => field.slice(1)));

  const selectedRecord = {};
  Object.entries(record).forEach(([key, value]) => {
    if (excludeFields.has(key)) return;
    if (includeFields.length === 0 || includeFields.includes(key) || (key === "id" && includeFields.includes("_id")) || (key === "_id" && includeFields.includes("id"))) {
      selectedRecord[key] = value;
    }
  });

  return selectedRecord;
}

async function executeFindOne(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  if (conditions.length === 0) {
    return null;
  }

  const rows = await query(`SELECT * FROM users WHERE ${conditions.join(" AND ")} LIMIT 1`, values);
  return normalizeUserRow(rows[0]) || null;
}

UserModel.findOne = function findOne(filter = {}) {
  let selectedFields = null;
  let leanMode = false;

  const queryBuilder = {
    select(fields) {
      selectedFields = fields;
      return this;
    },
    lean() {
      leanMode = true;
      return queryBuilder.exec();
    },
    async exec() {
      const record = await executeFindOne(filter);
      if (!record) return null;
      const result = applyProjection(record, selectedFields);
      return leanMode ? result : result;
    },
    then(resolve, reject) {
      return queryBuilder.exec().then(resolve, reject);
    },
    catch(reject) {
      return queryBuilder.exec().catch(reject);
    },
  };

  return queryBuilder;
};

UserModel.findById = function findById(id) {
  return UserModel.findOne({ _id: id });
};

UserModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
  const { password, isActive, is_active, profileImage, profile_image, role, name, email, phone, followers } = update;
  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (email !== undefined) { fields.push("email = ?"); values.push(email); }
  if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
  if (password !== undefined) { fields.push("password = ?"); values.push(password); }
  if (role !== undefined) { fields.push("role = ?"); values.push(role); }
  if (isActive !== undefined || is_active !== undefined) { fields.push("is_active = ?"); values.push((isActive ?? is_active) ? 1 : 0); }
  if (profileImage !== undefined || profile_image !== undefined) { fields.push("profile_image = ?"); values.push(profileImage ?? profile_image ?? ""); }
  if (followers !== undefined) { fields.push("followers = ?"); values.push(followers ? JSON.stringify(followers) : JSON.stringify([])); }

  if (fields.length === 0) return UserModel.findById(id);

  values.push(id);
  await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return UserModel.findById(id);
};

UserModel.findOneAndUpdate = async function findOneAndUpdate(filter = {}, update = {}) {
  const row = await UserModel.findOne(filter);
  if (!row) return null;
  await UserModel.findByIdAndUpdate(row._id, update);
  return UserModel.findById(row._id);
};

UserModel.create = async function create(data = {}) {
  const user = new UserModel(data);
  await user.save();
  return user;
};

UserModel.findByIdAndDelete = async function findByIdAndDelete(id) {
  const existing = await UserModel.findById(id);
  if (!existing) return null;
  await query("DELETE FROM users WHERE id = ?", [id]);
  return existing;
};

UserModel.findOneAndDelete = async function findOneAndDelete(filter = {}) {
  const existing = await UserModel.findOne(filter);
  if (!existing) return null;
  await query("DELETE FROM users WHERE id = ?", [existing._id]);
  return existing;
};

UserModel.find = function find(filter = {}) {
  let selectedFields = null;
  let sortClause = null;
  let skipValue = 0;
  let limitValue = null;
  let leanMode = false;

  const queryBuilder = {
    select(fields) {
      selectedFields = fields;
      return this;
    },
    sort(sortConfig) {
      sortClause = sortConfig;
      return this;
    },
    skip(value) {
      skipValue = Number(value) || 0;
      return this;
    },
    limit(value) {
      limitValue = Number(value) || null;
      return this;
    },
    lean() {
      leanMode = true;
      return queryBuilder.exec();
    },
    async exec() {
      const { conditions, values } = buildWhereClause(filter);
      if (conditions.length === 0) return [];

      let sql = `SELECT * FROM users WHERE ${conditions.join(" AND ")}`;
      if (sortClause) {
        const orderClauses = Object.entries(sortClause)
          .map(([key, direction]) => `${mapFieldName(key)} ${direction === -1 ? "DESC" : "ASC"}`)
          .join(", ");
        sql += ` ORDER BY ${orderClauses}`;
      }

      if (skipValue > 0) {
        sql += ` LIMIT ${skipValue}, ${limitValue || 18446744073709551615}`;
      } else if (limitValue) {
        sql += ` LIMIT ${limitValue}`;
      }

      const rows = await query(sql, values);
      const records = rows.map(normalizeUserRow).filter(Boolean);
      return records.map((record) => applyProjection(record, selectedFields));
    },
    then(resolve, reject) {
      return queryBuilder.exec().then(resolve, reject);
    },
    catch(reject) {
      return queryBuilder.exec().catch(reject);
    },
  };

  return queryBuilder;
};

UserModel.countDocuments = async function countDocuments(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  if (conditions.length === 0) {
    const rows = await query("SELECT COUNT(*) AS count FROM users");
    return Number(rows[0].count || 0);
  }
  const rows = await query(`SELECT COUNT(*) AS count FROM users WHERE ${conditions.join(" AND ")}`, values);
  return Number(rows[0].count || 0);
};

UserModel.exists = async function exists(filter = {}) {
  const count = await UserModel.countDocuments(filter);
  return count > 0;
};

module.exports = UserModel;
