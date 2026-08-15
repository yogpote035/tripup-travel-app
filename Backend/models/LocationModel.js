const { randomUUID } = require("crypto");
const { query } = require("../database/connection");

function safeParseJson(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
    return value;
}

function normalizeLocationRow(row) {
    if (!row) return null;
    return {
        _id: row.id || row._id,
        id: row.id || row._id,
        name: row.name,
        description: row.description,
        latitude: row.latitude,
        longitude: row.longitude,
        category: row.category || "Other",
        avgRating: Number(row.avg_rating ?? row.avgRating ?? 0) || 0,
        reviewCount: Number(row.review_count ?? row.reviewCount ?? 0) || 0,
        postCount: Number(row.post_count ?? row.postCount ?? 0) || 0,
        visitorCount: Number(row.visitor_count ?? row.visitorCount ?? 0) || 0,
        images: safeParseJson(row.images) || [],
        tags: safeParseJson(row.tags) || [],
        isPopular: row.is_popular ?? row.isPopular ?? false,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
        reviews: [],
        posts: [],
        visitors: [],
    };
}

function toDbLocation(item) {
    return {
        id: item._id || item.id || randomUUID(),
        name: item.name,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        category: item.category || "Other",
        avg_rating: item.avgRating ?? 0,
        review_count: item.reviewCount ?? 0,
        post_count: item.postCount ?? 0,
        visitor_count: item.visitorCount ?? 0,
        images: item.images ? JSON.stringify(item.images) : null,
        tags: item.tags ? JSON.stringify(item.tags) : null,
        is_popular: item.isPopular ?? false,
    };
}

class LocationModel {
    constructor(data = {}) {
        Object.assign(this, normalizeLocationRow(toDbLocation(data)));
    }

    async save() {
        const payload = toDbLocation(this);
        await query(
            `INSERT INTO locations (id, name, description, latitude, longitude, category, avg_rating, review_count, post_count, visitor_count, images, tags, is_popular, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), description = VALUES(description), latitude = VALUES(latitude), longitude = VALUES(longitude), category = VALUES(category), avg_rating = VALUES(avg_rating), review_count = VALUES(review_count), post_count = VALUES(post_count), visitor_count = VALUES(visitor_count), images = VALUES(images), tags = VALUES(tags), is_popular = VALUES(is_popular), updated_at = CURRENT_TIMESTAMP`,
            [payload.id, payload.name, payload.description, payload.latitude, payload.longitude, payload.category, payload.avg_rating, payload.review_count, payload.post_count, payload.visitor_count, payload.images, payload.tags, payload.is_popular ? 1 : 0, new Date(), new Date()]
        );
        return this;
    }
}

function buildLocationWhereClause(filter = {}) {
    const conditions = [];
    const values = [];

    const buildFieldCondition = (field, value, exactMatch = false) => {
        if (value instanceof RegExp) {
            conditions.push(`${field} REGEXP ?`);
            values.push(value.source);
            return;
        }
        if (exactMatch) {
            conditions.push(`${field} = ?`);
            values.push(value);
            return;
        }
        conditions.push(`${field} LIKE ?`);
        values.push(`%${String(value).trim()}%`);
    };

    if (filter._id || filter.id) {
        conditions.push("id = ?");
        values.push(filter._id || filter.id);
    }
    if (filter.name) {
        buildFieldCondition("name", filter.name, false);
    }
    if (filter.description) {
        buildFieldCondition("description", filter.description, false);
    }
    if (filter.category) {
        buildFieldCondition("category", filter.category, true);
    }
    if (filter.tags) {
        if (filter.tags instanceof RegExp) {
            conditions.push("tags REGEXP ?");
            values.push(filter.tags.source);
        } else {
            conditions.push("tags LIKE ?");
            values.push(`%${String(filter.tags).trim()}%`);
        }
    }
    if (filter.$or && Array.isArray(filter.$or)) {
        const orClauses = [];
        const orValues = [];
        for (const clause of filter.$or) {
            const { conditions: innerConditions, values: innerValues } = buildLocationWhereClause(clause);
            if (innerConditions.length) {
                orClauses.push(`(${innerConditions.join(" AND ")})`);
                orValues.push(...innerValues);
            }
        }
        if (orClauses.length) {
            conditions.push(`(${orClauses.join(" OR ")})`);
            values.push(...orValues);
        }
    }

    return { conditions, values };
}

LocationModel.find = function find(filter = {}) {
    const fieldMap = {
        _id: "id",
        id: "id",
        createdAt: "created_at",
        updatedAt: "updated_at",
        avgRating: "avg_rating",
        reviewCount: "review_count",
        postCount: "post_count",
        visitorCount: "visitor_count",
        isPopular: "is_popular",
    };
    const normalizeKey = (key) => fieldMap[key] || key;

    const queryBuilder = {
        sortValue: null,
        skipValue: 0,
        limitValue: 0,
        sort(sortValue) { this.sortValue = sortValue; return this; },
        skip(value) { this.skipValue = Number(value) || 0; return this; },
        limit(value) { this.limitValue = Number(value) || 0; return this; },
        async lean() {
            const { conditions, values } = buildLocationWhereClause(filter);
            let sql = "SELECT * FROM locations";
            if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
            if (this.sortValue) {
                const entries = typeof this.sortValue === "string"
                    ? this.sortValue.split(/\s+/).filter(Boolean).map((field) => [field.replace(/^-/, ""), field.startsWith("-") ? -1 : 1])
                    : Object.entries(this.sortValue);
                if (entries.length) {
                    const order = entries.map(([key, direction]) => `${normalizeKey(key)} ${direction === -1 ? "DESC" : "ASC"}`).join(", ");
                    sql += ` ORDER BY ${order}`;
                }
            }
            if (this.skipValue && this.limitValue) sql += ` LIMIT ${this.skipValue}, ${this.limitValue}`;
            else if (this.limitValue) sql += ` LIMIT ${this.limitValue}`;
            const rows = await query(sql, values);
            return rows.map(normalizeLocationRow);
        },
        async exec() {
            return queryBuilder.lean();
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

LocationModel.findById = async function findById(id) {
    const rows = await query("SELECT * FROM locations WHERE id = ? LIMIT 1", [id]);
    return normalizeLocationRow(rows[0]);
};

LocationModel.findOne = function findOne(filter = {}) {
    const queryBuilder = {
        async lean() {
            const { conditions, values } = buildLocationWhereClause(filter);
            if (!conditions.length) return null;
            const sql = `SELECT * FROM locations WHERE ${conditions.join(" AND ")} LIMIT 1`;
            const rows = await query(sql, values);
            return normalizeLocationRow(rows[0]);
        },
        async exec() {
            return queryBuilder.lean();
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

LocationModel.countDocuments = async function countDocuments(filter = {}) {
    const { conditions, values } = buildLocationWhereClause(filter);
    const rows = await query(
        `SELECT COUNT(*) AS count FROM locations${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""}`,
        values
    );
    return Number(rows[0]?.count || 0);
};

LocationModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
    const fields = [];
    const values = [];
    if (update.avgRating !== undefined) { fields.push("avg_rating = ?"); values.push(update.avgRating); }
    if (update.reviewCount !== undefined) { fields.push("review_count = ?"); values.push(update.reviewCount); }
    if (update.postCount !== undefined) { fields.push("post_count = ?"); values.push(update.postCount); }
    if (update.visitorCount !== undefined) { fields.push("visitor_count = ?"); values.push(update.visitorCount); }
    if (update.isPopular !== undefined) { fields.push("is_popular = ?"); values.push(update.isPopular ? 1 : 0); }
    if (update.description !== undefined) { fields.push("description = ?"); values.push(update.description); }
    if (update.category !== undefined) { fields.push("category = ?"); values.push(update.category); }
    if (fields.length === 0) return LocationModel.findById(id);
    values.push(id);
    await query(`UPDATE locations SET ${fields.join(", ")} WHERE id = ?`, values);
    return LocationModel.findById(id);
};

LocationModel.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await LocationModel.findById(id);
    if (!existing) return null;
    await query("DELETE FROM locations WHERE id = ?", [id]);
    return existing;
};

LocationModel.create = async function create(data = {}) {
    const item = new LocationModel(data);
    await item.save();
    return item;
};

module.exports = LocationModel;
