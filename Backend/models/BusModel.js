const { randomUUID } = require("crypto");
const { query } = require("../database/connection");
const { wrapDocument } = require("./sqlCompat");

function normalizeBusRow(row) {
  if (!row) return null;
  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    busNumber: row.bus_number || row.busNumber,
    company: row.company,
    operator: row.operator,
    route: row.route ? JSON.parse(row.route) : [],
    stationMap: row.station_map ? JSON.parse(row.station_map) : {},
    baseFarePerKm: row.base_fare_per_km || row.baseFarePerKm,
    departureTime: row.departure_time || row.departureTime,
    arrivalTime: row.arrival_time || row.arrivalTime,
    duration: row.duration,
    days: row.days ? JSON.parse(row.days) : [],
    type: row.type,
    driverLocation: row.driver_location ? JSON.parse(row.driver_location) : null,
    status: row.status,
    totalSeats: row.total_seats || row.totalSeats,
    availableSeats: row.available_seats || row.availableSeats,
    seats: row.seats ? JSON.parse(row.seats) : [],
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function toDbBus(item) {
  return {
    id: item._id || item.id || randomUUID(),
    bus_number: item.busNumber,
    company: item.company,
    operator: item.operator || "",
    route: item.route ? JSON.stringify(item.route) : JSON.stringify([]),
    station_map: item.stationMap ? JSON.stringify(item.stationMap) : JSON.stringify({}),
    base_fare_per_km: item.baseFarePerKm,
    departure_time: item.departureTime,
    arrival_time: item.arrivalTime,
    duration: item.duration,
    days: item.days ? JSON.stringify(item.days) : JSON.stringify([]),
    type: item.type,
    driver_location: item.driverLocation ? JSON.stringify(item.driverLocation) : null,
    status: item.status || "Active",
    total_seats: item.totalSeats,
    available_seats: item.availableSeats,
    seats: item.seats ? JSON.stringify(item.seats) : JSON.stringify([]),
  };
}

class BusModel {
  constructor(data = {}) {
    Object.assign(this, normalizeBusRow(toDbBus(data)));
  }

  async save() {
    const payload = toDbBus(this);
    await query(
      `INSERT INTO buses (id, bus_number, company, operator, route, station_map, base_fare_per_km, departure_time, arrival_time, duration, days, type, driver_location, status, total_seats, available_seats, seats, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE bus_number = VALUES(bus_number), company = VALUES(company), operator = VALUES(operator), route = VALUES(route), station_map = VALUES(station_map), base_fare_per_km = VALUES(base_fare_per_km), departure_time = VALUES(departure_time), arrival_time = VALUES(arrival_time), duration = VALUES(duration), days = VALUES(days), type = VALUES(type), driver_location = VALUES(driver_location), status = VALUES(status), total_seats = VALUES(total_seats), available_seats = VALUES(available_seats), seats = VALUES(seats), updated_at = CURRENT_TIMESTAMP`,
      [payload.id, payload.bus_number, payload.company, payload.operator, payload.route, payload.station_map, payload.base_fare_per_km, payload.departure_time, payload.arrival_time, payload.duration, payload.days, payload.type, payload.driver_location, payload.status, payload.total_seats, payload.available_seats, payload.seats, new Date(), new Date()]
    );
    return this;
  }
}

BusModel.find = function find(filter = {}) {
  return {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => {
      let sql = "SELECT * FROM buses";
      const values = [];
      const conditions = [];
      if (filter.company) { conditions.push("company = ?"); values.push(filter.company); }
      if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
      if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
      const rows = await query(sql, values);
      return rows.map(normalizeBusRow);
    },
  };
};

BusModel.findById = async function findById(id) {
  const rows = await query("SELECT * FROM buses WHERE id = ? LIMIT 1", [id]);
  return wrapDocument(normalizeBusRow(rows[0]));
};

BusModel.findOne = async function findOne(filter = {}) {
  let sql = "SELECT * FROM buses";
  const values = [];
  const conditions = [];
  if (filter.busNumber) { conditions.push("bus_number = ?"); values.push(filter.busNumber); }
  if (filter._id || filter.id) { conditions.push("id = ?"); values.push(filter._id || filter.id); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(`${sql} LIMIT 1`, values);
  return wrapDocument(normalizeBusRow(rows[0]));
};

BusModel.create = async function create(data = {}) {
  const item = new BusModel(data);
  await item.save();
  return item;
};

BusModel.countDocuments = async function countDocuments(filter = {}) {
  let sql = "SELECT COUNT(*) AS count FROM buses";
  const values = [];
  const conditions = [];
  if (filter.company) { conditions.push("company = ?"); values.push(filter.company); }
  if (filter.status) { conditions.push("status = ?"); values.push(filter.status); }
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  const rows = await query(sql, values);
  return Number(rows[0].count || 0);
};

BusModel.exists = async function exists(filter = {}) {
  return (await BusModel.countDocuments(filter)) > 0;
};

BusModel.prototype.deleteOne = async function deleteOne() {
  return BusModel.findByIdAndDelete(this._id || this.id);
};

module.exports = BusModel;
