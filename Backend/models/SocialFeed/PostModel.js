const { randomUUID } = require("crypto");
const { query } = require("../../database/connection");
const { wrapDocument } = require("../sqlCompat");

function normalizePostRow(row) {
  if (!row) return null;
  const safeParseObject = (val) => {
    if (!val && val !== 0) return null;
    if (typeof val === "object") return val;
    if (typeof val === "string") {
      const s = val.trim();
      if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("\"") && s.endsWith("\""))) {
        try {
          return JSON.parse(s);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const safeParseArray = (val) => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      const s = val.trim();
      if (s === "") return [];
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      // common fallback formats: comma-separated or single URL/string
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    title: row.title,
    description: row.description,
    location: row.location,
    travelDate: row.travel_date ? new Date(row.travel_date) : null,
    images: safeParseArray(row.images),
    tags: safeParseArray(row.tags),
    visibility: row.visibility || "public",
    author: safeParseObject(row.author),
    likes: safeParseArray(row.likes),
    bookmarks: safeParseArray(row.bookmarks),
    mentions: safeParseArray(row.mentions),
    pinned: row.pinned ? true : false,
    locationRating: row.location_rating || row.locationRating || 0,
    locationReviews: safeParseArray(row.location_reviews),
    comments: safeParseArray(row.comments),
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbPost(item) {
  return {
    id: item._id || item.id || randomUUID(),
    title: item.title,
    description: item.description,
    location: item.location,
    travel_date: item.travelDate,
    images: item.images ? JSON.stringify(item.images) : JSON.stringify([]),
    tags: item.tags ? JSON.stringify(item.tags) : JSON.stringify([]),
    visibility: item.visibility || "public",
    author: item.author ? JSON.stringify(item.author) : JSON.stringify({}),
    likes: item.likes ? JSON.stringify(item.likes) : JSON.stringify([]),
    bookmarks: item.bookmarks ? JSON.stringify(item.bookmarks) : JSON.stringify([]),
    mentions: item.mentions ? JSON.stringify(item.mentions) : JSON.stringify([]),
    pinned: item.pinned ? 1 : 0,
    location_rating: item.locationRating || 0,
    location_reviews: item.locationReviews ? JSON.stringify(item.locationReviews) : JSON.stringify([]),
    comments: item.comments ? JSON.stringify(item.comments) : JSON.stringify([]),
  };
}

class PostModel {
  constructor(data = {}) {
    Object.assign(this, normalizePostRow(toDbPost(data)));
  }

  async save() {
    const payload = toDbPost(this);
    await query(
      `INSERT INTO posts (id, title, description, location, travel_date, images, tags, visibility, author, likes, bookmarks, mentions, pinned, location_rating, location_reviews, comments, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), location = VALUES(location), travel_date = VALUES(travel_date), images = VALUES(images), tags = VALUES(tags), visibility = VALUES(visibility), author = VALUES(author), likes = VALUES(likes), bookmarks = VALUES(bookmarks), mentions = VALUES(mentions), pinned = VALUES(pinned), location_rating = VALUES(location_rating), location_reviews = VALUES(location_reviews), comments = VALUES(comments), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.title, payload.description, payload.location, payload.travel_date, payload.images, payload.tags, payload.visibility, payload.author, payload.likes, payload.bookmarks, payload.mentions, payload.pinned, payload.location_rating, payload.location_reviews, payload.comments, new Date(), new Date()]
    );
    return this;
  }
}

function getPostFieldExpression(key) {
  switch (key) {
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    case "travelDate":
      return "travel_date";
    case "locationRating":
      return "location_rating";
    case "locationReviews":
      return "location_reviews";
    case "author.id":
      return "JSON_UNQUOTE(JSON_EXTRACT(author, '$.id'))";
    default:
      if (key.startsWith("author.")) {
        return `JSON_UNQUOTE(JSON_EXTRACT(author, '$.${key.slice(7)}'))`;
      }
      return key;
  }
}

function isJsonArrayField(key) {
  return ["likes", "bookmarks", "mentions", "tags", "images", "location_reviews", "comments"].includes(key);
}

function buildWhereClause(filter = {}) {
  const conditions = [];
  const values = [];

  const addCondition = (field, operator, rawValue, options = {}) => {
    if (rawValue === undefined || rawValue === null) return;

    const sqlField = getPostFieldExpression(field);
    const value = rawValue;

    if (operator === "$in") {
      if (!Array.isArray(value) || value.length === 0) {
        conditions.push("1 = 0");
        return;
      }
      if (field === "visibility" || field === "location") {
        const placeholders = value.map(() => "?").join(", ");
        conditions.push(`${sqlField} IN (${placeholders})`);
        values.push(...value);
        return;
      }
      if (field === "author.id" || field.startsWith("author.")) {
        const placeholders = value.map(() => "?").join(", ");
        conditions.push(`${sqlField} IN (${placeholders})`);
        values.push(...value);
        return;
      }
      conditions.push("1 = 0");
      return;
    }

    if (operator === "$regex") {
      const regexValue = value instanceof RegExp ? value.source : String(value);
      const isCaseInsensitive =
        (rawValue instanceof RegExp && rawValue.flags?.includes("i")) ||
        String(options.$options || "").includes("i");
      const pattern = isCaseInsensitive ? `%${regexValue.toLowerCase()}%` : `%${regexValue}%`;
      const fieldExpr = sqlField;
      const expr = isCaseInsensitive ? `LOWER(${fieldExpr}) LIKE ?` : `${fieldExpr} LIKE ?`;
      conditions.push(expr);
      values.push(pattern);
      return;
    }

    if (isJsonArrayField(field)) {
      if (operator === "$ne") {
        conditions.push(`NOT JSON_CONTAINS(${sqlField}, JSON_QUOTE(?), '$')`);
        values.push(value);
        return;
      }
      if (operator === "$eq") {
        conditions.push(`JSON_CONTAINS(${sqlField}, JSON_QUOTE(?), '$')`);
        values.push(value);
        return;
      }
      return;
    }

    if (operator === "$ne") {
      conditions.push(`${sqlField} != ?`);
      values.push(value);
      return;
    }

    if (operator === "$gt") {
      conditions.push(`${sqlField} > ?`);
      values.push(value);
      return;
    }

    if (operator === "$gte") {
      conditions.push(`${sqlField} >= ?`);
      values.push(value);
      return;
    }

    if (operator === "$lt") {
      conditions.push(`${sqlField} < ?`);
      values.push(value);
      return;
    }

    if (operator === "$lte") {
      conditions.push(`${sqlField} <= ?`);
      values.push(value);
      return;
    }

    if (operator === "$exists") {
      if (value) {
        conditions.push(`${sqlField} IS NOT NULL`);
      } else {
        conditions.push(`${sqlField} IS NULL`);
      }
      return;
    }

    conditions.push(`${sqlField} = ?`);
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
            const { conditions: subConditions, values: subValues } = buildWhereClause(subFilter);
            if (subConditions.length === 0) return null;
            return { conditions: subConditions, values: subValues };
          })
          .filter(Boolean);

        if (orClauses.length > 0) {
          const clauseSql = orClauses.map(({ conditions: subConditions }) => `(${subConditions.join(" AND ")})`).join(" OR ");
          conditions.push(`(${clauseSql})`);
          orClauses.forEach(({ values: subValues }) => values.push(...subValues));
        }
        return;
      }

      if (value instanceof RegExp) {
        addCondition(key, "$regex", value, {});
        return;
      }

      if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        if (value.$regex !== undefined) {
          addCondition(key, "$regex", value.$regex, value);
          return;
        }
        if (value.$in !== undefined) {
          addCondition(key, "$in", value.$in, value);
          return;
        }
        if (value.$exists !== undefined) {
          addCondition(key, "$exists", value.$exists, value);
          return;
        }
        Object.entries(value).forEach(([operator, operatorValue]) => {
          if (operator.startsWith("$")) {
            addCondition(key, operator, operatorValue, value);
          }
        });
        return;
      }

      addCondition(key, "$eq", value);
    });
  };

  walk(filter);
  return { conditions, values };
}

function mapPostSortKey(key) {
  switch (key) {
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    case "travelDate":
      return "travel_date";
    case "locationRating":
      return "location_rating";
    case "likes.length":
      return "JSON_LENGTH(likes)";
    case "comments.length":
      return "JSON_LENGTH(comments)";
    default:
      if (key.startsWith("author.")) {
        return `JSON_UNQUOTE(JSON_EXTRACT(author, '$.${key.slice(7)}'))`;
      }
      return getPostFieldExpression(key);
  }
}

PostModel.find = function find(filter = {}) {
  let sortClause = null;
  let skipValue = 0;
  let limitValue = null;
  let leanMode = false;

  const queryBuilder = {
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
    lean() {
      leanMode = true;
      return queryBuilder.exec();
    },
    async exec() {
      const { conditions, values } = buildWhereClause(filter);
      let sql = "SELECT * FROM posts";
      if (conditions.length) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
      }
      if (sortClause) {
        const orderClauses = Object.entries(sortClause)
          .map(([key, direction]) => `${mapPostSortKey(key)} ${direction === -1 ? "DESC" : "ASC"}`)
          .join(", ");
        if (orderClauses) sql += ` ORDER BY ${orderClauses}`;
      }
      if (skipValue > 0) {
        sql += ` LIMIT ${skipValue}, ${limitValue || 18446744073709551615}`;
      } else if (limitValue) {
        sql += ` LIMIT ${limitValue}`;
      }
      const rows = await query(sql, values);
      return rows.map(normalizePostRow);
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

PostModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM posts WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizePostRow(rows[0]));
};

PostModel.create = async function create(data = {}) {
  const item = new PostModel(data);
  await item.save();
  return item;
};

PostModel.countDocuments = async function countDocuments(filter = {}) {
  const { conditions, values } = buildWhereClause(filter);
  let sql = "SELECT COUNT(*) AS count FROM posts";
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

PostModel.exists = async function exists(filter = {}) {
  return (await PostModel.countDocuments(filter)) > 0;
};

PostModel.findByIdAndDelete = async function findByIdAndDelete(id) {
  const existing = await PostModel.findById(id);
  if (!existing) return null;
  await query("DELETE FROM posts WHERE id = ?", [id]);
  return existing;
};

PostModel.findByIdAndUpdate = async function findByIdAndUpdate(id, update = {}) {
  const payload = update.$set || update;
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "_id" || key === "id") continue;
    if (key === "comments") { fields.push("comments = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "likes") { fields.push("likes = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "bookmarks") { fields.push("bookmarks = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "locationReviews") { fields.push("location_reviews = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "locationRating") { fields.push("location_rating = ?"); values.push(value); }
    else if (key === "travelDate") { fields.push("travel_date = ?"); values.push(value); }
    else if (key === "author") { fields.push("author = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify({})); }
    else if (key === "images") { fields.push("images = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "tags") { fields.push("tags = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "mentions") { fields.push("mentions = ?"); values.push(value ? JSON.stringify(value) : JSON.stringify([])); }
    else if (key === "pinned") { fields.push("pinned = ?"); values.push(value ? 1 : 0); }
    else if (key === "visibility") { fields.push("visibility = ?"); values.push(value); }
    else if (key === "title") { fields.push("title = ?"); values.push(value); }
    else if (key === "description") { fields.push("description = ?"); values.push(value); }
    else if (key === "location") { fields.push("location = ?"); values.push(value); }
  }
  if (fields.length === 0) return PostModel.findById(id);
  values.push(id);
  await query(`UPDATE posts SET ${fields.join(", ")} WHERE id = ?`, values);
  return PostModel.findById(id);
};

PostModel.prototype.deleteOne = async function deleteOne() {
  return PostModel.findByIdAndDelete(this._id || this.id);
};

module.exports = PostModel;
