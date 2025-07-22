const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  busName: String,
  route: [String],
  departureTime: String,
  arrivalTime: String,
  days: [String],
  price: Number,
});

const BusModel = mongoose.model("BusModel", BusSchema);
module.exports = BusModel;