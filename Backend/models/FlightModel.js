const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  from: String,
  to: String,
  departureTime: String,
  arrivalTime: String,
  duration: String,
  days: [String],
  price: Number,
});
const FlightModel = mongoose.model("FlightModel", FlightSchema);
module.exports = FlightModel;