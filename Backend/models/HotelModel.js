const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function deserializeArrayField(value) {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value;
    const raw = String(value).trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch (err) {
        // ignore invalid JSON and try CSV fallback
    }

    return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeHotelRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        name: row.name,
        city: row.city,
        address: row.address,
        description: row.description,
        starRating: Number(row.star_rating ?? row.starRating ?? 0),
        pricePerNight: Number(row.price_per_night ?? row.pricePerNight ?? 0),
        availableRooms: Number(row.available_rooms ?? row.availableRooms ?? 0),
        amenities: deserializeArrayField(row.amenities),
        images: deserializeArrayField(row.images),
        roomTypes: deserializeArrayField(row.room_types),
        reviews: deserializeArrayField(row.reviews),
        averageRating: Number(row.average_rating ?? row.averageRating ?? 0),
        reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
        isActive: row.is_active ?? row.isActive ?? true,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
}

function toSnakeCase(field) {
    return String(field)
        .replace(/([A-Z])/g, "_$1")
        .replace(/^_/, "")
        .toLowerCase();
}

function mapHotelFieldName(field) {
    if (!field) return null;
    const normalizedField = field.replace(/^\$/, "");
    const fieldMap = {
        name: "name",
        city: "city",
        address: "address",
        description: "description",
        starRating: "star_rating",
        pricePerNight: "price_per_night",
        availableRooms: "available_rooms",
        amenities: "amenities",
        images: "images",
        roomTypes: "room_types",
        reviews: "reviews",
        averageRating: "average_rating",
        reviewCount: "review_count",
        isActive: "is_active",
        createdAt: "created_at",
        updatedAt: "updated_at",
    };
    return fieldMap[normalizedField] || toSnakeCase(normalizedField);
}

function buildHotelWhereClause(filter = {}) {
    const conditions = [];
    const values = [];

    if (filter.$or && Array.isArray(filter.$or)) {
        const orClauses = filter.$or
            .map((entry) => {
                const parts = Object.entries(entry).map(([key, value]) => {
                    const column = mapHotelFieldName(key);
                    if (!column) return null;
                    if (value instanceof RegExp) {
                        values.push(`%${value.source}%`);
                        return `${column} LIKE ?`;
                    }
                    values.push(value);
                    return `${column} = ?`;
                }).filter(Boolean);
                return parts.length ? `(${parts.join(" AND ")})` : null;
            })
            .filter(Boolean);
        if (orClauses.length) {
            conditions.push(`(${orClauses.join(" OR ")})`);
        }
    }

    if (filter.city !== undefined) {
        conditions.push("city = ?");
        values.push(filter.city);
    }

    if (filter.isActive !== undefined) {
        conditions.push("is_active = ?");
        values.push(filter.isActive ? 1 : 0);
    }

    return { conditions, values };
}

function toDbHotel(item) {
    return {
        id: item._id || item.id || randomUUID(),
        name: item.name,
        city: item.city,
        address: item.address,
        description: item.description || "",
        star_rating: item.starRating || 3,
        price_per_night: item.pricePerNight || 0,
        available_rooms: item.availableRooms || 1,
        amenities: item.amenities ? JSON.stringify(item.amenities) : JSON.stringify([]),
        images: item.images ? JSON.stringify(item.images) : JSON.stringify([]),
        room_types: item.roomTypes ? JSON.stringify(item.roomTypes) : JSON.stringify([]),
        reviews: item.reviews ? JSON.stringify(item.reviews) : JSON.stringify([]),
        average_rating: item.averageRating || 0,
        review_count: item.reviewCount || 0,
        is_active: item.isActive ?? true,
    };
}

class HotelModel {
    constructor(data = {}) {
        Object.assign(this, normalizeHotelRow(toDbHotel(data)));
    }

    async save() {
        const payload = toDbHotel(this);
        await query(
            `INSERT INTO hotels (id, name, city, address, description, star_rating, price_per_night, available_rooms, amenities, images, room_types, reviews, average_rating, review_count, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), city = VALUES(city), address = VALUES(address), description = VALUES(description), star_rating = VALUES(star_rating), price_per_night = VALUES(price_per_night), available_rooms = VALUES(available_rooms), amenities = VALUES(amenities), images = VALUES(images), room_types = VALUES(room_types), reviews = VALUES(reviews), average_rating = VALUES(average_rating), review_count = VALUES(review_count), is_active = VALUES(is_active), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.name, payload.city, payload.address, payload.description, payload.star_rating, payload.price_per_night, payload.available_rooms, payload.amenities, payload.images, payload.room_types, payload.reviews, payload.average_rating, payload.review_count, payload.is_active ? 1 : 0, new Date(), new Date()]
        );
        return this;
    }
}

HotelModel.find = function find(filter = {}) {
    let sortClause = null;
    let skipValue = 0;
    let limitValue = null;

    return {
        sort(sortSpec) {
            sortClause = sortSpec;
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
        async lean() {
            const { conditions, values } = buildHotelWhereClause(filter);
            let sql = "SELECT * FROM hotels";
            if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;

            if (sortClause && Object.keys(sortClause).length) {
                const sortParts = Object.entries(sortClause).map(([field, direction]) => {
                    const column = mapHotelFieldName(field) || toSnakeCase(field);
                    return `${column} ${direction === -1 ? "DESC" : "ASC"}`;
                });
                sql += ` ORDER BY ${sortParts.join(", ")}`;
            }

            if (skipValue > 0) {
                sql += ` LIMIT ${skipValue}, ${limitValue || 18446744073709551615}`;
            } else if (limitValue) {
                sql += ` LIMIT ${limitValue}`;
            }

            const rows = await query(sql, values);
            return rows.map(normalizeHotelRow);
        },
    };
};

HotelModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM hotels WHERE id = ? LIMIT 1", [id]);
    return wrapDocument(normalizeHotelRow(rows[0]));
};

HotelModel.findOne = async function findOne(filter = {}) {
    let sql = "SELECT * FROM hotels";
    const values = [];
    const conditions = [];
    if (filter.name) { conditions.push("name = ?"); values.push(filter.name); }
    if (filter._id || filter.id) { conditions.push("id = ?"); values.push(filter._id || filter.id); }
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    const rows = await query(`${sql} LIMIT 1`, values);
    return wrapDocument(normalizeHotelRow(rows[0]));
};

HotelModel.create = async function create(data = {}) {
    const item = new HotelModel(data);
    await item.save();
    return item;
};

HotelModel.countDocuments = async function countDocuments(filter = {}) {
    let sql = "SELECT COUNT(*) AS count FROM hotels";
    const values = [];
    const conditions = [];
    if (filter.city) { conditions.push("city = ?"); values.push(filter.city); }
    if (filter.isActive !== undefined) { conditions.push("is_active = ?"); values.push(filter.isActive ? 1 : 0); }
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    const rows = await query(sql, values);
    return Number(rows[0].count || 0);
};

HotelModel.exists = async function exists(filter = {}) {
    return (await HotelModel.countDocuments(filter)) > 0;
};

HotelModel.prototype.deleteOne = async function deleteOne() {
    return HotelModel.findByIdAndDelete(this._id || this.id);
};

HotelModel.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await HotelModel.findById(id);
    if (!existing) return null;
    await query("DELETE FROM hotels WHERE id = ?", [id]);
    return existing;
};

HotelModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
    const payload = update.$set || update;
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(payload)) {
        if (key === "_id" || key === "id") continue;
        if (key === "name") { fields.push("name = ?"); values.push(value); }
        else if (key === "city") { fields.push("city = ?"); values.push(value); }
        else if (key === "address") { fields.push("address = ?"); values.push(value); }
        else if (key === "description") { fields.push("description = ?"); values.push(value); }
        else if (key === "starRating") { fields.push("star_rating = ?"); values.push(value); }
        else if (key === "pricePerNight") { fields.push("price_per_night = ?"); values.push(value); }
        else if (key === "availableRooms") { fields.push("available_rooms = ?"); values.push(value); }
        else if (key === "amenities") { fields.push("amenities = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
        else if (key === "images") { fields.push("images = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
        else if (key === "roomTypes") { fields.push("room_types = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
        else if (key === "reviews") { fields.push("reviews = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
        else if (key === "averageRating") { fields.push("average_rating = ?"); values.push(value); }
        else if (key === "reviewCount") { fields.push("review_count = ?"); values.push(value); }
        else if (key === "isActive") { fields.push("is_active = ?"); values.push(value ? 1 : 0); }
    }
    if (fields.length === 0) return HotelModel.findById(id);
    values.push(id);
    await query(`UPDATE hotels SET ${fields.join(", ")} WHERE id = ?`, values);
    return HotelModel.findById(id);
};

module.exports = HotelModel;
