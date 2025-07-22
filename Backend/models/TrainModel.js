const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema({
  coachType: String,
  coachCode: String,
  capacity: Number,
  availableSeats: Number,
  fare: Number,
  seats: [
    {
      seatNumber: Number,
      isBooked: { type: Boolean, default: false },
    },
  ],
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: String,
  trainType: String,
  route: [String],
  departureTime: String,
  arrivalTime: String,
  days: [String],
  coaches: [coachSchema],
});

module.exports = mongoose.model("Train", trainSchema);