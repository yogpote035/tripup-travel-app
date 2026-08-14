const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeFlightRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    flightNumber: row.flight_number || row.flightNumber,
    airline: row.airline,
    aircraft: row.aircraft,
    from: row.from_city || row.from,
    sourceAirport: row.source_airport || row.sourceAirport,
    to: row.to_city || row.to,
    destinationAirport: row.destination_airport || row.destinationAirport,
    departureTime: row.departure_time || row.departureTime,
    arrivalTime: row.arrival_time || row.arrivalTime,
    duration: row.duration,
    stops: row.stops || 0,
    status: row.status,
    days: parseJsonArray(row.days),
    price: row.price,
    basePrice: row.base_price || row.basePrice,
    totalSeats: row.total_seats || row.totalSeats,
    availableSeats: row.available_seats || row.availableSeats,
    seats: parseJsonArray(row.seats),
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbFlight(item) {
  return {
    id: item._id || item.id || randomUUID(),
    flight_number: item.flightNumber,
    airline: item.airline,
    aircraft: item.aircraft || "",
    from_city: item.from,
    source_airport: item.sourceAirport || "",
    to_city: item.to,
    destination_airport: item.destinationAirport || "",
    departure_time: item.departureTime,
    arrival_time: item.arrivalTime,
    duration: item.duration,
    stops: item.stops || 0,
    status: item.status || "Scheduled",
    days: item.days ? JSON.stringify(item.days) : JSON.stringify([]),
    price: item.price,
    base_price: item.basePrice,
    total_seats: item.totalSeats,
    available_seats: item.availableSeats,
    seats: item.seats ? JSON.stringify(item.seats) : JSON.stringify([]),
  };
}

function mapFlightFieldName(key) {
  switch (key) {
    case "_id":
    case "id":
      return "id";
    case "flightNumber":
      return "flight_number";
    case "from":
      return "from_city";
    case "to":
      return "to_city";
    case "sourceAirport":
      return "source_airport";
    case "destinationAirport":
      return "destination_airport";
    case "departureTime":
      return "departure_time";
    case "arrivalTime":
      return "arrival_time";
    case "basePrice":
      return "base_price";
    case "totalSeats":
      return "total_seats";
    case "availableSeats":
      return "available_seats";
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return key;
  }
}

function normalizeFlightFilterValue(fieldName, value) {
  if (fieldName === "total_seats" || fieldName === "available_seats" || fieldName === "stops") {
    return Number(value);
  }
  return value;
}

function buildFlightWhereClause(filter = {}) {
  const conditions = [];
  const values = [];

  const addCondition = (fieldName, operator, rawValue, options = {}) => {
    const dbField = mapFlightFieldName(fieldName);
    const value = normalizeFlightFilterValue(dbField, rawValue);

    // `days` is a JSON array. A customer search passes one weekday, so an
    // equality comparison would never match the stored JSON document.
    if (dbField === "days" && operator === "$eq") {
      conditions.push("JSON_CONTAINS(days, JSON_QUOTE(?))");
      values.push(String(value));
      return;
    }

    if (dbField === "days" && operator === "$in") {
      if (!Array.isArray(value) || value.length === 0) {
        conditions.push("1 = 0");
        return;
      }
      conditions.push(`(${value.map(() => "JSON_CONTAINS(days, JSON_QUOTE(?))").join(" OR ")})`);
      values.push(...value.map(String));
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
      values.push(...value.map((item) => normalizeFlightFilterValue(dbField, item)));
      return;
    }

    if (operator === "$exists") {
      conditions.push(value ? `${dbField} IS NOT NULL` : `${dbField} IS NULL`);
      return;
    }

    if (operator === "$regex") {
      const regexValue = value instanceof RegExp ? value.source : String(value);
      const isCaseInsensitive =
        (rawValue instanceof RegExp && rawValue.flags?.includes("i")) ||
        String(options.$options || "").includes("i");
      const expr = isCaseInsensitive ? `LOWER(${dbField}) REGEXP ?` : `${dbField} REGEXP ?`;
      conditions.push(expr);
      values.push(isCaseInsensitive ? regexValue.toLowerCase() : regexValue);
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
            const { conditions: subConditions, values: subValues } = buildFlightWhereClause(subFilter);
            if (subConditions.length === 0) return null;
            return { conditions: subConditions, values: subValues };
          })
          .filter(Boolean);
        if (orClauses.length > 0) {
          conditions.push(`(${orClauses.map(({ conditions: subConditions }) => `(${subConditions.join(" AND ")})`).join(" OR ")})`);
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

class FlightModel {
  constructor(data = {}) {
    Object.assign(this, normalizeFlightRow(toDbFlight(data)));
  }

  async save() {
    const payload = toDbFlight(this);
    await query(
      `INSERT INTO flights (id, flight_number, airline, aircraft, from_city, source_airport, to_city, destination_airport, departure_time, arrival_time, duration, stops, status, days, price, base_price, total_seats, available_seats, seats, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE flight_number = VALUES(flight_number), airline = VALUES(airline), aircraft = VALUES(aircraft), from_city = VALUES(from_city), source_airport = VALUES(source_airport), to_city = VALUES(to_city), destination_airport = VALUES(destination_airport), departure_time = VALUES(departure_time), arrival_time = VALUES(arrival_time), duration = VALUES(duration), stops = VALUES(stops), status = VALUES(status), days = VALUES(days), price = VALUES(price), base_price = VALUES(base_price), total_seats = VALUES(total_seats), available_seats = VALUES(available_seats), seats = VALUES(seats), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.flight_number, payload.airline, payload.aircraft, payload.from_city, payload.source_airport, payload.to_city, payload.destination_airport, payload.departure_time, payload.arrival_time, payload.duration, payload.stops, payload.status, payload.days, payload.price, payload.base_price, payload.total_seats, payload.available_seats, payload.seats, new Date(), new Date()]
    );
    return this;
  }
}

FlightModel.find = function find(filter = {}) {
  let selectedFields = null;
  let sortClause = null;
  let skipValue = 0;
  let limitValue = null;

  const queryBuilder = {
    select(fields) {
      selectedFields = fields;
      return this;
    },
    populate() {
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
    async lean() {
      return queryBuilder.exec();
    },
    async exec() {
      const { conditions, values } = buildFlightWhereClause(filter);
      let sql = "SELECT * FROM flights";
      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

      if (sortClause) {
        const orderClauses = Object.entries(sortClause)
          .map(([key, direction]) => `${mapFlightFieldName(key)} ${direction === -1 ? "DESC" : "ASC"}`)
          .join(", ");
        if (orderClauses) sql += ` ORDER BY ${orderClauses}`;
      }

      if (skipValue > 0) {
        sql += ` LIMIT ${skipValue}, ${limitValue || 18446744073709551615}`;
      } else if (limitValue) {
        sql += ` LIMIT ${limitValue}`;
      }

      const rows = await query(sql, values);
      return rows.map((row) => applyProjection(normalizeFlightRow(row), selectedFields));
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

FlightModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM flights WHERE id = ? LIMIT 1", [id]);
  const row = normalizeFlightRow(rows[0]);
  if (!row) return null;
  return Object.assign(new FlightModel(row), {
    lean: async () => ({ ...row }),
    select() { return this; },
    populate() { return this; },
    exec: async () => this,
  });
};

FlightModel.findOne = async function findOne(filter = {}) {
  let sql = "SELECT * FROM flights";
  const values = [];
  const conditions = [];
  if (filter.flightNumber) { conditions.push("flight_number = ?"); values.push(filter.flightNumber); }
  if (filter._id || filter.id) { conditions.push("id = ?"); values.push(filter._id || filter.id); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  const row = normalizeFlightRow(rows[0]);
  if (!row) return null;
  return Object.assign(new FlightModel(row), {
    lean: async () => ({ ...row }),
    select() { return this; },
    populate() { return this; },
    exec: async () => this,
  });
};

FlightModel.create = async function create(data = {}) {
  const item = new FlightModel(data);
  await item.save();
  return item;
};

FlightModel.findByIdAndDelete = async function findByIdAndDelete(id) {
  const existing = await FlightModel.findById(id);
  if (!existing) return null;
  await query("DELETE FROM flights WHERE id = ?", [id]);
  return existing;
};

FlightModel.countDocuments = async function countDocuments(filter = {}) {
  const { conditions, values } = buildFlightWhereClause(filter);
  const sql = conditions.length
    ? `SELECT COUNT(*) AS count FROM flights WHERE ${conditions.join(" AND ")}`
    : "SELECT COUNT(*) AS count FROM flights";
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

FlightModel.exists = async function exists(filter = {}) {
  return (await FlightModel.countDocuments(filter)) > 0;
};

FlightModel.prototype.deleteOne = async function deleteOne() {
  return FlightModel.findByIdAndDelete(this._id || this.id);
};

FlightModel.__test__ = { buildFlightWhereClause, normalizeFlightRow };

module.exports = FlightModel;
