const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  seatType: String,
  isBooked: {
    type: Boolean,
    default: false,
  },
  passengerName: {
    type: String,
    default: null,
  },
  bookingTime: {
    type: Date,
    default: null,
  },
});

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: String,
    required: true,
  },

  route: [String],
  stationMap: {
    type: Map,
    of: new mongoose.Schema({
      distance: {
        type: Number,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
    }),
    required: true,
  },

  baseFarePerKm: {
    type: Number,
    required: true,
  },

  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  duration: String,

  days: [String],
  type: String,

  totalSeats: Number,
  availableSeats: Number,

  seats: [seatSchema],
});

const BusModel = mongoose.model("BusModel", busSchema);
module.exports = BusModel;
