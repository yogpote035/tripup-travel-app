const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }
  return value;
}

function normalizeTrainRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    trainNumber: row.train_number || row.trainNumber,
    trainName: row.train_name || row.trainName,
    trainType: row.train_type || row.trainType,
    journeyTime: row.journey_time || row.journeyTime,
    status: row.status,
    route: safeJsonParse(row.route, []),
    stationDistances: safeJsonParse(row.station_distances, {}),
    departure: safeJsonParse(row.departure, null),
    arrival: safeJsonParse(row.arrival, null),
    days: safeJsonParse(row.days, []),
    coaches: safeJsonParse(row.coaches, []),
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbTrain(item) {
  return {
    id: item._id || item.id || randomUUID(),
    train_number: item.trainNumber,
    train_name: item.trainName,
    train_type: item.trainType,
    journey_time: item.journeyTime,
    status: item.status || "Active",
    route: item.route ? JSON.stringify(item.route) : JSON.stringify([]),
    station_distances: item.stationDistances ? JSON.stringify(item.stationDistances) : JSON.stringify({}),
    departure: item.departure ? JSON.stringify(item.departure) : null,
    arrival: item.arrival ? JSON.stringify(item.arrival) : null,
    days: item.days ? JSON.stringify(item.days) : JSON.stringify([]),
    coaches: item.coaches ? JSON.stringify(item.coaches) : JSON.stringify([]),
  };
}

class TrainModel {
  constructor(data = {}) {
    Object.assign(this, normalizeTrainRow(toDbTrain(data)));
  }

  async save() {
    const payload = toDbTrain(this);
    await query(
      `INSERT INTO trains (id, train_number, train_name, train_type, journey_time, status, route, station_distances, departure, arrival, days, coaches, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE train_number = VALUES(train_number), train_name = VALUES(train_name), train_type = VALUES(train_type), journey_time = VALUES(journey_time), status = VALUES(status), route = VALUES(route), station_distances = VALUES(station_distances), departure = VALUES(departure), arrival = VALUES(arrival), days = VALUES(days), coaches = VALUES(coaches), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.train_number, payload.train_name, payload.train_type, payload.journey_time, payload.status, payload.route, payload.station_distances, payload.departure, payload.arrival, payload.days, payload.coaches, new Date(), new Date()]
    );
    return this;
  }
}

TrainModel.find = function find(filter = {}) {
  return {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => {
      let sql = "SELECT * FROM trains";
      const values = [];
      const conditions = [];
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
      if (filter.trainType) { conditions.push("train_type = ?"); values.push(filter.trainType); }
      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
      const rows = await query(sql, values);
      return rows.map(normalizeTrainRow);
    },
  };
};

TrainModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM trains WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizeTrainRow(rows[0]));
};

TrainModel.findOne = async function findOne(filter = {}) {
  let sql = "SELECT * FROM trains";
  const values = [];
  const conditions = [];
  if (filter.trainNumber) { conditions.push("train_number = ?"); values.push(filter.trainNumber); }
  if (filter._id || filter.id) { conditions.push("id = ?"); values.push(filter._id || filter.id); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  return wrapDocument(normalizeTrainRow(rows[0]));
};

TrainModel.create = async function create(data = {}) {
  const item = new TrainModel(data);
  await item.save();
  return item;
};

TrainModel.countDocuments = async function countDocuments(filter = {}) {
  let sql = "SELECT COUNT(*) AS count FROM trains";
  const values = [];
  const conditions = [];
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
  if (filter.trainType) { conditions.push("train_type = ?"); values.push(filter.trainType); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

TrainModel.exists = async function exists(filter = {}) {
  return (await TrainModel.countDocuments(filter)) > 0;
};

TrainModel.prototype.deleteOne = async function deleteOne() {
  return TrainModel.findByIdAndDelete(this._id || this.id);
};

module.exports = TrainModel;
