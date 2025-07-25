const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  seatType: String,
  seatClass: String,
  isBooked: { type: Boolean, default: false },
  passengerName: { type: String, default: null },
  bookingTime: { type: Date, default: null },
});

const coachSchema = new mongoose.Schema({
  coachType: String,
  coachCode: String,
  capacity: Number,
  availableSeats: Number,
  baseFarePerKm: Number,
  seats: [seatSchema],
});

const timeSchema = new mongoose.Schema({
  station: { type: String, required: true },
  time: { type: String, required: true },
  platform: { type: String },
  dayOffset: { type: Number, default: 0 }, // Used for multi-day journeys
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: String,
  trainType: String,

  route: [String],

  stationDistances: {
    type: Map,
    of: Number,
    required: true,
    // Maps station names to distances in kilometers from the start station
    //eg: { "StationA": 100, "StationB": 200 }
  },

  departure: timeSchema,
  arrival: timeSchema,
  days: [String],

  coaches: [coachSchema],
});

module.exports = mongoose.model("TrainModel", trainSchema);
