const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /\S+@\S+\.\S+/,
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
  },
});

const flightBookingSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },
  journeyDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  farePerSeat: {
    type: Number,
    required: true,
    min: 0,
  },
  totalFare: {
    type: Number,
    required: true,
    min: 0,
  },
  passengers: {
    type: [passengerSchema],
    required: true,
    validate: [val => val.length >= 1, "At least one passenger is required."],
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    required: true,
  }
});

const FlightBookingModel = mongoose.model("FlightBooking", flightBookingSchema);
module.exports = FlightBookingModel;
