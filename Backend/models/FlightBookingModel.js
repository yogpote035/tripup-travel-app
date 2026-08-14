const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      try {
        return JSON.parse(String(value).replace(/^\s+|\s+$/g, ""));
      } catch {
        return fallback;
      }
    }
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) return value;
    if (Buffer.isBuffer(value)) {
      try {
        return JSON.parse(value.toString("utf8"));
      } catch {
        return fallback;
      }
    }
    return value;
  }

  return value;
}

function normalizeFlightBookingRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    user: row.user_id || row.user,
    flight: row.flight_id || row.flight,
    journeyDate: row.journey_date ? new Date(row.journey_date) : null,
    bookingDate: row.booking_date ? new Date(row.booking_date) : null,
    from: row.from_city || row.from,
    to: row.to_city || row.to,
    farePerSeat: row.fare_per_seat || row.farePerSeat,
    totalFare: row.total_fare || row.totalFare,
    payment: safeJsonParse(row.payment, { status: "pending" }),
    passengers: safeJsonParse(row.passengers, []),
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbFlightBooking(item) {
  return {
    id: item._id || item.id || randomUUID(),
    user_id: item.user,
    flight_id: item.flight,
    journey_date: item.journeyDate,
    booking_date: item.bookingDate || new Date(),
    from_city: item.from,
    to_city: item.to,
    fare_per_seat: item.farePerSeat,
    total_fare: item.totalFare,
    payment: item.payment ? JSON.stringify(item.payment) : JSON.stringify({ status: "pending" }),
    passengers: item.passengers ? JSON.stringify(item.passengers) : JSON.stringify([]),
    status: item.status || "booked",
  };
}

class FlightBookingModel {
  constructor(data = {}) {
    Object.assign(this, normalizeFlightBookingRow(toDbFlightBooking(data)));
  }

  async save() {
    const payload = toDbFlightBooking(this);
    await query(
      `INSERT INTO flight_bookings (id, user_id, flight_id, journey_date, booking_date, from_city, to_city, fare_per_seat, total_fare, payment, passengers, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), flight_id = VALUES(flight_id), journey_date = VALUES(journey_date), booking_date = VALUES(booking_date), from_city = VALUES(from_city), to_city = VALUES(to_city), fare_per_seat = VALUES(fare_per_seat), total_fare = VALUES(total_fare), payment = VALUES(payment), passengers = VALUES(passengers), status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.user_id, payload.flight_id, payload.journey_date, payload.booking_date, payload.from_city, payload.to_city, payload.fare_per_seat, payload.total_fare, payload.payment, payload.passengers, payload.status, new Date(), new Date()]
    );
    return this;
  }
}

FlightBookingModel.find = function find(filter = {}) {
  let sortConfig = {};
  let skipValue = 0;
  let limitValue = null;

  return {
    sort(sortSpec) {
      sortConfig = sortSpec || {};
      return this;
    },
    skip(amount) {
      skipValue = Number(amount) || 0;
      return this;
    },
    limit(amount) {
      limitValue = Number(amount) || null;
      return this;
    },
    lean: async () => {
      let sql = "SELECT * FROM flight_bookings";
      const values = [];
      const conditions = [];

      if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
      if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
      if (filter.flight) { conditions.push("flight_id = ?"); values.push(filter.flight); }
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }

      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

      // Apply sorting
      if (sortConfig && Object.keys(sortConfig).length > 0) {
        const orderClauses = Object.entries(sortConfig).map(([key, direction]) => {
          const colMap = {
            bookingDate: "booking_date",
            createdAt: "created_at",
            updatedAt: "updated_at",
            journeyDate: "journey_date",
          };
          const col = colMap[key] || key;
          return `${col} ${direction === -1 ? "DESC" : "ASC"}`;
        });
        if (orderClauses.length) sql += ` ORDER BY ${orderClauses.join(", ")}`;
      }

      if (skipValue > 0) {
        sql += ` LIMIT ${skipValue}, ${limitValue || 18446744073709551615}`;
      } else if (limitValue) {
        sql += ` LIMIT ${limitValue}`;
      }

      const rows = await query(sql, values);
      return rows.map(normalizeFlightBookingRow);
    },
  };
};

FlightBookingModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM flight_bookings WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizeFlightBookingRow(rows[0]));
};

FlightBookingModel.create = async function create(data = {}) {
  const item = new FlightBookingModel(data);
  await item.save();
  return item;
};

FlightBookingModel.countDocuments = async function countDocuments(filter = {}) {
  let sql = "SELECT COUNT(*) AS count FROM flight_bookings";
  const values = [];
  const conditions = [];
  if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
  if (filter.flight) { conditions.push("flight_id = ?"); values.push(filter.flight); }
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

FlightBookingModel.exists = async function exists(filter = {}) {
  return (await FlightBookingModel.countDocuments(filter)) > 0;
};

FlightBookingModel.prototype.deleteOne = async function deleteOne() {
  return FlightBookingModel.findByIdAndDelete(this._id || this.id);
};

module.exports = FlightBookingModel;
