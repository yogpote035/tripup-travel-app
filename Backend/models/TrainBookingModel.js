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

function normalizeTrainBookingRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    user: row.user_id || row.user,
    trainNumber: row.train_number || row.trainNumber,
    trainName: row.train_name || row.trainName,
    coachType: row.coach_type || row.coachType,
    seatNumbers: safeJsonParse(row.seat_numbers, []),
    passengerNames: safeJsonParse(row.passenger_names, []),
    from: row.from_city || row.from,
    to: row.to_city || row.to,
    journeyDate: row.journey_date ? new Date(row.journey_date) : null,
    fare: row.fare,
    payment: safeJsonParse(row.payment, { status: "pending" }),
    email: row.email,
    phone: row.phone,
    bookedAt: row.booked_at ? new Date(row.booked_at) : null,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbTrainBooking(item) {
  return {
    id: item._id || item.id || randomUUID(),
    user_id: item.user,
    train_number: item.trainNumber,
    train_name: item.trainName,
    coach_type: item.coachType,
    seat_numbers: item.seatNumbers ? JSON.stringify(item.seatNumbers) : JSON.stringify([]),
    passenger_names: item.passengerNames ? JSON.stringify(item.passengerNames) : JSON.stringify([]),
    from_city: item.from,
    to_city: item.to,
    journey_date: item.journeyDate,
    fare: item.fare,
    payment: item.payment ? JSON.stringify(item.payment) : JSON.stringify({ status: "pending" }),
    email: item.email,
    phone: item.phone,
    booked_at: item.bookedAt || new Date(),
    status: item.status || "booked",
  };
}

class TrainBookingModel {
  constructor(data = {}) {
    Object.assign(this, normalizeTrainBookingRow(toDbTrainBooking(data)));
  }

  async save() {
    const payload = toDbTrainBooking(this);
    await query(
      `INSERT INTO train_bookings (id, user_id, train_number, train_name, coach_type, seat_numbers, passenger_names, from_city, to_city, journey_date, fare, payment, email, phone, booked_at, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), train_number = VALUES(train_number), train_name = VALUES(train_name), coach_type = VALUES(coach_type), seat_numbers = VALUES(seat_numbers), passenger_names = VALUES(passenger_names), from_city = VALUES(from_city), to_city = VALUES(to_city), journey_date = VALUES(journey_date), fare = VALUES(fare), payment = VALUES(payment), email = VALUES(email), phone = VALUES(phone), booked_at = VALUES(booked_at), status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.user_id, payload.train_number, payload.train_name, payload.coach_type, payload.seat_numbers, payload.passenger_names, payload.from_city, payload.to_city, payload.journey_date, payload.fare, payload.payment, payload.email, payload.phone, payload.booked_at, payload.status, new Date(), new Date()]
    );
    return this;
  }
}

TrainBookingModel.find = function find(filter = {}) {
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
      let sql = "SELECT * FROM train_bookings";
      const values = [];
      const conditions = [];

      if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
      if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
      if (filter.trainNumber) { conditions.push("train_number = ?"); values.push(filter.trainNumber); }
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }

      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

      // Apply sorting
      if (sortConfig && Object.keys(sortConfig).length > 0) {
        const orderClauses = Object.entries(sortConfig).map(([key, direction]) => {
          const colMap = {
            bookedAt: "booked_at",
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
      return rows.map(normalizeTrainBookingRow);
    },
  };
};

TrainBookingModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM train_bookings WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizeTrainBookingRow(rows[0]));
};

TrainBookingModel.create = async function create(data = {}) {
  const item = new TrainBookingModel(data);
  await item.save();
  return item;
};

TrainBookingModel.countDocuments = async function countDocuments(filter = {}) {
  let sql = "SELECT COUNT(*) AS count FROM train_bookings";
  const values = [];
  const conditions = [];

  if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
  if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
  if (filter.trainNumber) { conditions.push("train_number = ?"); values.push(filter.trainNumber); }
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }

  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

TrainBookingModel.exists = async function exists(filter = {}) {
  return (await TrainBookingModel.countDocuments(filter)) > 0;
};

TrainBookingModel.prototype.deleteOne = async function deleteOne() {
  return TrainBookingModel.findByIdAndDelete(this._id || this.id);
};

module.exports = TrainBookingModel;
