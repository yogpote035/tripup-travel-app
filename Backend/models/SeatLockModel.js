const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function normalizeSeatLockRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    resource: row.resource_id || row.resource,
    bookingType: row.booking_type || row.bookingType,
    seatNumber: row.seat_number || row.seatNumber,
    booking: row.booking_id || row.booking,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbSeatLock(item) {
  return {
    id: item._id || item.id || randomUUID(),
    resource_id: item.resource,
    booking_type: item.bookingType,
    seat_number: item.seatNumber,
    booking_id: item.booking,
    expires_at: item.expiresAt,
  };
}

class SeatLockModel {
  constructor(data = {}) {
    Object.assign(this, normalizeSeatLockRow(toDbSeatLock(data)));
  }

  async save() {
    const payload = toDbSeatLock(this);
    await query(
      `INSERT INTO seat_locks (id, resource_id, booking_type, seat_number, booking_id, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE resource_id = VALUES(resource_id), booking_type = VALUES(booking_type), seat_number = VALUES(seat_number), booking_id = VALUES(booking_id), expires_at = VALUES(expires_at), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.resource_id, payload.booking_type, payload.seat_number, payload.booking_id, payload.expires_at, new Date(), new Date()]
    );
    return this;
  }
}

SeatLockModel.findOne = async function findOne(filter = {}) {
  let sql = "SELECT * FROM seat_locks";
  const values = [];
  const conditions = [];
  if (filter.resource) { conditions.push("resource_id = ?"); values.push(filter.resource); }
  if (filter.bookingType) { conditions.push("booking_type = ?"); values.push(filter.bookingType); }
  if (filter.seatNumber) { conditions.push("seat_number = ?"); values.push(filter.seatNumber); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  return normalizeSeatLockRow(rows[0]);
};

SeatLockModel.create = async function create(data = {}) {
  const item = new SeatLockModel(data);
  await item.save();
  return item;
};

SeatLockModel.insertMany = async function insertMany(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const created = await Promise.all(items.map((item) => SeatLockModel.create(item)));
  return created;
};

SeatLockModel.deleteMany = async function deleteMany(filter = {}) {
  const values = [];
  const conditions = [];

  if (filter.resource) {
    conditions.push("resource_id = ?");
    values.push(filter.resource);
  }

  if (filter.bookingType) {
    conditions.push("booking_type = ?");
    values.push(filter.bookingType);
  }

  if (filter.seatNumber) {
    conditions.push("seat_number = ?");
    values.push(filter.seatNumber);
  }

  if (filter.booking) {
    conditions.push("booking_id = ?");
    values.push(filter.booking);
  }

  if (conditions.length === 0) {
    return { deletedCount: 0 };
  }

  const rows = await query(
    `SELECT id FROM seat_locks WHERE ${conditions.join(" AND ")}`,
    values
  );

  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return { deletedCount: 0 };
  }

  await Promise.all(ids.map((id) => query("DELETE FROM seat_locks WHERE id = ?", [id])));
  return { deletedCount: ids.length };
};

module.exports = SeatLockModel;
