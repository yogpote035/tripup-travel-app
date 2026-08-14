const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");
const BusModel = require("./BusModel");

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

function normalizeBusBookingRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    bus: row.bus_id || row.bus,
    journeyDate: row.journey_date ? new Date(row.journey_date) : null,
    userId: row.user_id || row.userId,
    source: row.source,
    destination: row.destination,
    distance: row.distance,
    farePerSeat: row.fare_per_seat || row.farePerSeat,
    totalFare: row.total_fare || row.totalFare,
    payment: safeJsonParse(row.payment, { status: "pending" }),
    passengers: safeJsonParse(row.passengers, []),
    bookingDate: row.booking_date ? new Date(row.booking_date) : null,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbBusBooking(item) {
  return {
    id: item._id || item.id || randomUUID(),
    bus_id: item.bus,
    journey_date: item.journeyDate,
    user_id: item.userId,
    source: item.source,
    destination: item.destination,
    distance: item.distance,
    fare_per_seat: item.farePerSeat,
    total_fare: item.totalFare,
    payment: item.payment ? JSON.stringify(item.payment) : JSON.stringify({ status: "pending" }),
    passengers: item.passengers ? JSON.stringify(item.passengers) : JSON.stringify([]),
    booking_date: item.bookingDate || new Date(),
    status: item.status || "booked",
  };
}

class BusBookingModel {
  constructor(data = {}) {
    Object.assign(this, normalizeBusBookingRow(toDbBusBooking(data)));
  }

  async save() {
    const payload = toDbBusBooking(this);
    await query(
      `INSERT INTO bus_bookings (id, bus_id, journey_date, user_id, source, destination, distance, fare_per_seat, total_fare, payment, passengers, booking_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE bus_id = VALUES(bus_id), journey_date = VALUES(journey_date), user_id = VALUES(user_id), source = VALUES(source), destination = VALUES(destination), distance = VALUES(distance), fare_per_seat = VALUES(fare_per_seat), total_fare = VALUES(total_fare), payment = VALUES(payment), passengers = VALUES(passengers), booking_date = VALUES(booking_date), status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.bus_id, payload.journey_date, payload.user_id, payload.source, payload.destination, payload.distance, payload.fare_per_seat, payload.total_fare, payload.payment, payload.passengers, payload.booking_date, payload.status, new Date(), new Date()]
    );
    return this;
  }
}

BusBookingModel.find = function find(filter = {}) {
  let sortConfig = {};
  let skipValue = 0;
  let limitValue = null;
  let populatePaths = [];

  const runPopulate = async (bookings) => {
    if (!bookings || !bookings.length || !populatePaths.length) return bookings;

    const busIds = [...new Set(bookings.map((booking) => booking && (booking.bus || booking.busId)).filter(Boolean))];
    if (!busIds.length) return bookings;

    const busData = await Promise.all(busIds.map(async (busId) => BusModel.findById(busId)));
    const busMap = new Map(busData.filter(Boolean).map((bus) => [(bus._id || bus.id), bus]));

    return bookings.map((booking) => {
      if (!booking) return booking;
      const busId = booking.bus || booking.busId;
      if (busId && busMap.has(busId)) {
        booking.bus = busMap.get(busId);
      }
      return booking;
    });
  };

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
    populate(path) {
      if (path) populatePaths.push(path);
      return this;
    },
    lean: async () => {
      let sql = "SELECT * FROM bus_bookings";
      const values = [];
      const conditions = [];

      if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
      if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
      if (filter.bus) { conditions.push("bus_id = ?"); values.push(filter.bus); }
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }

      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

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
      const result = rows.map(normalizeBusBookingRow);
      return runPopulate(result);
    },
  };
};

BusBookingModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM bus_bookings WHERE id = ? LIMIT 1", [id]);
  const booking = wrapDocument(normalizeBusBookingRow(rows[0]));

  const attachPopulate = (path) => {
    if (!booking || !path) return booking;
    if (path === "bus" || path === "bus_id") {
      const busId = booking.bus || booking.busId;
      if (busId) {
        return BusModel.findById(busId)
          .then((bus) => {
            if (bus) booking.bus = bus;
            return booking;
          });
      }
    }
    return booking;
  };

  const result = booking;
  result.populate = attachPopulate;
  return result;
};

BusBookingModel.create = async function create(data = {}) {
  const item = new BusBookingModel(data);
  await item.save();
  return item;
};

BusBookingModel.countDocuments = async function countDocuments(filter = {}) {
  let sql = "SELECT COUNT(*) AS count FROM bus_bookings";
  const values = [];
  const conditions = [];
  if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
  if (filter.bus) { conditions.push("bus_id = ?"); values.push(filter.bus); }
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

BusBookingModel.exists = async function exists(filter = {}) {
  return (await BusBookingModel.countDocuments(filter)) > 0;
};

BusBookingModel.prototype.deleteOne = async function deleteOne() {
  return BusBookingModel.findByIdAndDelete(this._id || this.id);
};

module.exports = BusBookingModel;
