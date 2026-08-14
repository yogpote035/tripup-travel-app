const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function safeParseJson(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    try {
      const parsed = JSON.parse(trimmed);
      return parsed ?? fallback;
    } catch (error) {
      if (Array.isArray(fallback)) {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      if (typeof fallback === "object" && fallback !== null) {
        return {};
      }

      return trimmed;
    }
  }

  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value;
  return fallback;
}

function normalizeItineraryRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    user: row.user_id || row.user,
    origin: row.origin,
    destination: row.destination,
    startDate: row.start_date || row.startDate,
    endDate: row.end_date || row.endDate,
    interests: safeParseJson(row.interests, []),
    tripType: row.trip_type || row.tripType,
    startTime: row.start_time || row.startTime,
    endTime: row.end_time || row.endTime,
    transportMode: row.transport_mode || row.transportMode,
    budget: row.budget,
    plan: safeParseJson(row.plan, []),
    meta: safeParseJson(row.meta, {}),
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbItinerary(item) {
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    id: item._id || item.id || randomUUID(),
    user_id: item.user,
    origin: item.origin,
    destination: item.destination,
    start_date: item.startDate,
    end_date: item.endDate,
    interests: JSON.stringify(normalizeArray(item.interests)),
    trip_type: item.tripType,
    start_time: item.startTime,
    end_time: item.endTime,
    transport_mode: item.transportMode,
    budget: item.budget,
    plan: JSON.stringify(Array.isArray(item.plan) ? item.plan : []),
    meta: JSON.stringify(item.meta || {}),
  };
}

class ItineraryModel {
  constructor(data = {}) {
    Object.assign(this, normalizeItineraryRow(toDbItinerary(data)));
  }

  async save() {
    const payload = toDbItinerary(this);
    await query(
      `INSERT INTO itineraries (id, user_id, origin, destination, start_date, end_date, interests, trip_type, start_time, end_time, transport_mode, budget, plan, meta, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), origin = VALUES(origin), destination = VALUES(destination), start_date = VALUES(start_date), end_date = VALUES(end_date), interests = VALUES(interests), trip_type = VALUES(trip_type), start_time = VALUES(start_time), end_time = VALUES(end_time), transport_mode = VALUES(transport_mode), budget = VALUES(budget), plan = VALUES(plan), meta = VALUES(meta), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.user_id, payload.origin, payload.destination, payload.start_date, payload.end_date, payload.interests, payload.trip_type, payload.start_time, payload.end_time, payload.transport_mode, payload.budget, payload.plan, payload.meta, new Date(), new Date()]
    );
    return this;
  }

  toObject() {
    return normalizeItineraryRow(toDbItinerary(this));
  }

  async deleteOne() {
    return ItineraryModel.findByIdAndDelete(this._id);
  }
}

function buildWhereClause(filter = {}) {
  const conditions = [];
  const values = [];
  const fieldMap = {
    user: "user_id",
    userId: "user_id",
    _id: "id",
    id: "id",
    startDate: "start_date",
    endDate: "end_date",
    tripType: "trip_type",
    startTime: "start_time",
    endTime: "end_time",
    transportMode: "transport_mode",
  };

  const normalizeKey = (key) => fieldMap[key] || key;

  for (const [key, value] of Object.entries(filter || {})) {
    if (key === "$or") continue;
    if (value === undefined || value === null) continue;
    const column = normalizeKey(key);
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if (value.$regex) {
        const regexValue = String(value.$regex).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        conditions.push(`${column} LIKE ?`);
        values.push(`%${regexValue}%`);
      } else if (value.$in) {
        const placeholders = value.$in.map(() => "?").join(",");
        conditions.push(`${column} IN (${placeholders})`);
        values.push(...value.$in);
      } else {
        conditions.push(`${column} = ?`);
        values.push(value);
      }
    } else {
      conditions.push(`${column} = ?`);
      values.push(value);
    }
  }
  if (filter.$or && Array.isArray(filter.$or)) {
    const orParts = filter.$or.map((entry) => {
      const inner = buildWhereClause(entry);
      return inner.conditions.length ? `(${inner.conditions.join(" AND ")})` : "(1=1)";
    });
    conditions.push(`(${orParts.join(" OR ")})`);
    values.push(...filter.$or.flatMap((entry) => buildWhereClause(entry).values));
  }
  return { conditions, values };
}

ItineraryModel.find = function find(filter = {}) {
  return {
    filter,
    select() { return this; },
    populate() { return this; },
    sort(sortValue) { this.sortValue = sortValue; return this; },
    skip(value) { this.skipValue = Number(value) || 0; return this; },
    limit(value) { this.limitValue = Number(value) || 0; return this; },
    async lean() { return ItineraryModel._findMany(this.filter, this); },
    async exec() { return ItineraryModel._findMany(this.filter, this); },
  };
};

ItineraryModel._findMany = async function _findMany(filter = {}, builder = {}) {
  const fieldMap = {
    user: "user_id",
    userId: "user_id",
    _id: "id",
    id: "id",
    startDate: "start_date",
    endDate: "end_date",
    tripType: "trip_type",
    startTime: "start_time",
    endTime: "end_time",
    transportMode: "transport_mode",
    createdAt: "created_at",
    updatedAt: "updated_at",
  };
  const normalizeKey = (key) => fieldMap[key] || key;

  const { conditions, values } = buildWhereClause(filter);
  let sql = "SELECT * FROM itineraries";
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  if (builder.sortValue) {
    const entries = Object.entries(builder.sortValue);
    if (entries.length) {
      const order = entries.map(([key, direction]) => `${normalizeKey(key)} ${direction === -1 ? "DESC" : "ASC"}`).join(", ");
      sql += ` ORDER BY ${order}`;
    }
  }
  if (builder.skipValue) sql += ` LIMIT ${builder.skipValue}, ${builder.limitValue || 100}`;
  else if (builder.limitValue) sql += ` LIMIT ${builder.limitValue}`;
  const rows = await query(sql, values);
  return rows.map(normalizeItineraryRow);
};

ItineraryModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM itineraries WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizeItineraryRow(rows[0]));
};

ItineraryModel.findOne = async function findOne(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  const rows = await query(`SELECT * FROM itineraries WHERE ${conditions.join(" AND ")} LIMIT 1`, values);
  return wrapDocument(normalizeItineraryRow(rows[0]));
};

ItineraryModel.countDocuments = async function countDocuments(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  const rows = await query(conditions.length ? `SELECT COUNT(*) AS count FROM itineraries WHERE ${conditions.join(" AND ")}` : "SELECT COUNT(*) AS count FROM itineraries", values);
  return Number(rows[0].count || 0);
};

ItineraryModel.create = async function create(data = {}) {
  const item = new ItineraryModel(data);
  await item.save();
  return item;
};

ItineraryModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
  const payload = update.$set || update;
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "_id" || key === "id") continue;
    if (key === "user") { fields.push("user_id = ?"); values.push(value); }
    else if (key === "startDate") { fields.push("start_date = ?"); values.push(value); }
    else if (key === "endDate") { fields.push("end_date = ?"); values.push(value); }
    else if (key === "tripType") { fields.push("trip_type = ?"); values.push(value); }
    else if (key === "startTime") { fields.push("start_time = ?"); values.push(value); }
    else if (key === "endTime") { fields.push("end_time = ?"); values.push(value); }
    else if (key === "transportMode") { fields.push("transport_mode = ?"); values.push(value); }
    else if (key === "plan") { fields.push("plan = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "meta") { fields.push("meta = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify({})); }
    else if (key === "interests") { fields.push("interests = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "updatedAt") { continue; }
    else { fields.push(`${key} = ?`); values.push(value); }
  }
  if (fields.length === 0) return ItineraryModel.findById(id);
  values.push(id);
  await query(`UPDATE itineraries SET ${fields.join(", ")} WHERE id = ?`, values);
  return ItineraryModel.findById(id);
};

ItineraryModel.findByIdAndDelete = async function findByIdAndDelete(id) {
  const existing = await ItineraryModel.findById(id);
  if (!existing) return null;
  await query("DELETE FROM itineraries WHERE id = ?", [id]);
  return existing;
};

module.exports = ItineraryModel;
