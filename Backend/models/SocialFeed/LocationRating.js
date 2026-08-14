const { randomUUID } = require("crypto");
const { query } = require("../../database/connection");
const { wrapDocument } = require("../sqlCompat");

function normalizeLocationRatingRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    locationId: row.location_id || row.locationId,
    locationName: row.location_name || row.locationName,
    ratings: row.ratings ? JSON.parse(row.ratings) : [],
    averageRating: row.average_rating || row.averageRating || 0,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbLocationRating(item) {
  return {
    id: item._id || item.id || randomUUID(),
    location_id: item.locationId,
    location_name: item.locationName,
    ratings: item.ratings ? JSON.stringify(item.ratings) : JSON.stringify([]),
    average_rating: item.averageRating || 0,
  };
}

class LocationRatingModel {
  constructor(data = {}) {
    Object.assign(this, normalizeLocationRatingRow(toDbLocationRating(data)));
  }

  async save() {
    const payload = toDbLocationRating(this);
    await query(
      `INSERT INTO location_ratings (id, location_id, location_name, ratings, average_rating, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE location_id = VALUES(location_id), location_name = VALUES(location_name), ratings = VALUES(ratings), average_rating = VALUES(average_rating), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.location_id, payload.location_name, payload.ratings, payload.average_rating, new Date(), new Date()]
    );
    return this;
  }
}

LocationRatingModel.findOne = async function findOne(filter = {}) {
  const values = [];
  let sql = "SELECT * FROM location_ratings";
  const conditions = [];
  if (filter.locationId) { conditions.push("location_id = ?"); values.push(filter.locationId); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  return wrapDocument(normalizeLocationRatingRow(rows[0]));
};

LocationRatingModel.create = async function create(data = {}) {
  const item = new LocationRatingModel(data);
  await item.save();
  return item;
};

module.exports = LocationRatingModel;
