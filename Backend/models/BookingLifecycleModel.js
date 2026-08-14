const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

const jsonOrDefault = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

const toSqlNull = (value) => (value === undefined ? null : value);

function normalizeBookingLifecycleRow(row) {
  if (!row) return null;
  return {
    _id: row.id ?? row._id,
    id: row.id ?? row._id,
    user: row.user_id ?? row.user,
    bookingType: row.booking_type ?? row.bookingType,
    resource: row.resource_id ?? row.resource,
    route: jsonOrDefault(row.route, { from: null, to: null, journeyDate: null }),
    passengers: jsonOrDefault(row.passengers, []),
    seatNumbers: jsonOrDefault(row.seat_numbers, []),
    amount: row.amount,
    payment: jsonOrDefault(row.payment, { status: "pending" }),
    status: row.status,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    paymentReference: row.payment_reference ?? row.paymentReference ?? null,
    cancellationReason: row.cancellation_reason ?? row.cancellationReason ?? null,
    refund: jsonOrDefault(row.refund, { status: "not_requested" }),
    ticketNumber: row.ticket_number ?? row.ticketNumber ?? null,
    qrCodePayload: row.qr_code_payload ?? row.qrCodePayload ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbBookingLifecycle(item) {
  return {
    id: item._id || item.id || randomUUID(),
    user_id: toSqlNull(item.user),
    booking_type: item.bookingType,
    resource_id: item.resource,
    route: item.route ? JSON.stringify(item.route) : JSON.stringify({ from: null, to: null, journeyDate: null }),
    passengers: item.passengers ? JSON.stringify(item.passengers) : JSON.stringify([]),
    seat_numbers: item.seatNumbers ? JSON.stringify(item.seatNumbers) : JSON.stringify([]),
    amount: item.amount,
    payment: item.payment ? JSON.stringify(item.payment) : JSON.stringify({ status: "pending" }),
    status: item.status || "pending",
    expires_at: item.expiresAt,
    payment_reference: toSqlNull(item.paymentReference),
    cancellation_reason: toSqlNull(item.cancellationReason),
    refund: item.refund === undefined ? JSON.stringify({ status: "not_requested" }) : JSON.stringify(item.refund ?? { status: "not_requested" }),
    ticket_number: toSqlNull(item.ticketNumber),
    qr_code_payload: toSqlNull(item.qrCodePayload),
  };
}

class BookingLifecycleModel {
  constructor(data = {}) {
    Object.assign(this, normalizeBookingLifecycleRow(toDbBookingLifecycle(data)));
  }

  async save() {
    const payload = toDbBookingLifecycle(this);
    await query(
      `INSERT INTO booking_lifecycles (id, user_id, booking_type, resource_id, route, passengers, seat_numbers, amount, payment, status, expires_at, payment_reference, cancellation_reason, refund, ticket_number, qr_code_payload, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), booking_type = VALUES(booking_type), resource_id = VALUES(resource_id), route = VALUES(route), passengers = VALUES(passengers), seat_numbers = VALUES(seat_numbers), amount = VALUES(amount), payment = VALUES(payment), status = VALUES(status), expires_at = VALUES(expires_at), payment_reference = VALUES(payment_reference), cancellation_reason = VALUES(cancellation_reason), refund = VALUES(refund), ticket_number = VALUES(ticket_number), qr_code_payload = VALUES(qr_code_payload), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.user_id, payload.booking_type, payload.resource_id, payload.route, payload.passengers, payload.seat_numbers, payload.amount, payload.payment, payload.status, payload.expires_at, payload.payment_reference, payload.cancellation_reason, payload.refund, payload.ticket_number, payload.qr_code_payload, new Date(), new Date()]
    );
    return this;
  }
}

BookingLifecycleModel.find = function find(filter = {}) {
  return {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => {
      let sql = "SELECT * FROM booking_lifecycles";
      const values = [];
      const conditions = [];
      if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
      if (filter.bookingType) { conditions.push("booking_type = ?"); values.push(filter.bookingType); }
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
      const rows = await query(sql, values);
      return rows.map(normalizeBookingLifecycleRow);
    },
  };
};

BookingLifecycleModel.findOne = async function findOne(filter = {}) {
  let sql = "SELECT * FROM booking_lifecycles";
  const values = [];
  const conditions = [];
  if (filter._id || filter.id) { conditions.push("id = ?"); values.push(filter._id || filter.id); }
  if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  return wrapDocument(normalizeBookingLifecycleRow(rows[0]), BookingLifecycleModel);
};

BookingLifecycleModel.create = async function create(data = {}) {
  const item = new BookingLifecycleModel(data);
  await item.save();
  return item;
};

module.exports = BookingLifecycleModel;
