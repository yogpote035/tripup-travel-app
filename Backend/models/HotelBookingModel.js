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

function normalizeHotelBookingRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        user: row.user_id || row.user,
        hotel: row.hotel_id || row.hotel,
        hotelName: row.hotel_name || row.hotelName,
        roomType: row.room_type || row.roomType,
        checkIn: row.check_in ? new Date(row.check_in) : null,
        checkOut: row.check_out ? new Date(row.check_out) : null,
        rooms: row.rooms || 1,
        guests: row.guests || 1,
        totalFare: row.total_fare || row.totalFare,
        status: row.status,
        bookingDate: row.booking_date ? new Date(row.booking_date) : null,
        payment: safeJsonParse(row.payment, { status: "pending" }),
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function toDbHotelBooking(item) {
    return {
        id: item._id || item.id || randomUUID(),
        user_id: item.user,
        hotel_id: item.hotel,
        hotel_name: item.hotelName,
        room_type: item.roomType,
        check_in: item.checkIn,
        check_out: item.checkOut,
        rooms: item.rooms || 1,
        guests: item.guests || 1,
        total_fare: item.totalFare || 0,
        status: item.status || "pending",
        booking_date: item.bookingDate || new Date(),
        payment: item.payment ? JSON.stringify(item.payment) : JSON.stringify({ status: "pending" }),
    };
}

class HotelBookingModel {
    constructor(data = {}) {
        Object.assign(this, normalizeHotelBookingRow(toDbHotelBooking(data)));
    }

    async save() {
        const payload = toDbHotelBooking(this);
        await query(
            `INSERT INTO hotel_bookings (id, user_id, hotel_id, hotel_name, room_type, check_in, check_out, rooms, guests, total_fare, status, booking_date, payment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), hotel_id = VALUES(hotel_id), hotel_name = VALUES(hotel_name), room_type = VALUES(room_type), check_in = VALUES(check_in), check_out = VALUES(check_out), rooms = VALUES(rooms), guests = VALUES(guests), total_fare = VALUES(total_fare), status = VALUES(status), booking_date = VALUES(booking_date), payment = VALUES(payment), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.user_id, payload.hotel_id, payload.hotel_name, payload.room_type, payload.check_in, payload.check_out, payload.rooms, payload.guests, payload.total_fare, payload.status, payload.booking_date, payload.payment, new Date(), new Date()]
        );
        return this;
    }
}

HotelBookingModel.find = function find(filter = {}) {
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
            let sql = "SELECT * FROM hotel_bookings";
            const values = [];
            const conditions = [];

            if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
            if (filter.userId) { conditions.push("user_id = ?"); values.push(filter.userId); }
            if (filter.hotel) { conditions.push("hotel_id = ?"); values.push(filter.hotel); }
            if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }

            if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

            // Apply sorting
            if (sortConfig && Object.keys(sortConfig).length > 0) {
                const orderClauses = Object.entries(sortConfig).map(([key, direction]) => {
                    const colMap = {
                        bookingDate: "booking_date",
                        createdAt: "created_at",
                        updatedAt: "updated_at",
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
            return rows.map(normalizeHotelBookingRow);
        },
    };
};

HotelBookingModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM hotel_bookings WHERE id = ? LIMIT 1", [id]);
    return wrapDocument(normalizeHotelBookingRow(rows[0]));
};

HotelBookingModel.create = async function create(data = {}) {
    const item = new HotelBookingModel(data);
    await item.save();
    return item;
};

HotelBookingModel.countDocuments = async function countDocuments(filter = {}) {
    let sql = "SELECT COUNT(*) AS count FROM hotel_bookings";
    const values = [];
    const conditions = [];
    if (filter.user) { conditions.push("user_id = ?"); values.push(filter.user); }
    if (filter.hotel) { conditions.push("hotel_id = ?"); values.push(filter.hotel); }
    if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    const rows = await query(sql, values);
    return Number(rows[0].count || 0);
};

HotelBookingModel.exists = async function exists(filter = {}) {
    return (await HotelBookingModel.countDocuments(filter)) > 0;
};

HotelBookingModel.prototype.deleteOne = async function deleteOne() {
    return HotelBookingModel.findByIdAndDelete(this._id || this.id);
};

HotelBookingModel.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await HotelBookingModel.findById(id);
    if (!existing) return null;
    await query("DELETE FROM hotel_bookings WHERE id = ?", [id]);
    return existing;
};

HotelBookingModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
    const payload = update.$set || update;
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(payload)) {
        if (key === "_id" || key === "id") continue;
        if (key === "status") { fields.push("status = ?"); values.push(value); }
        else if (key === "totalFare") { fields.push("total_fare = ?"); values.push(value); }
        else if (key === "roomType") { fields.push("room_type = ?"); values.push(value); }
        else if (key === "hotelName") { fields.push("hotel_name = ?"); values.push(value); }
        else if (key === "checkIn") { fields.push("check_in = ?"); values.push(value); }
        else if (key === "checkOut") { fields.push("check_out = ?"); values.push(value); }
        else if (key === "bookingDate") { fields.push("booking_date = ?"); values.push(value); }
        else if (key === "payment") { fields.push("payment = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify({ status: "pending" })); }
    }
    if (fields.length === 0) return HotelBookingModel.findById(id);
    values.push(id);
    await query(`UPDATE hotel_bookings SET ${fields.join(", ")} WHERE id = ?`, values);
    return HotelBookingModel.findById(id);
};

module.exports = HotelBookingModel;
