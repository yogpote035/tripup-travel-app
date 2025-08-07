const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
    uppercase: true,
  },
  email: {
    type: String,
    required: true,
    match: /\S+@\S+\.\S+/,
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/, // Indian phone number format
  },
});

const flightBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FlightModel",
    required: true,
  },

  journeyDate: {
    type: Date,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },

  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
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
    validate: [(val) => val.length >= 1, "At least one passenger is required."],
  },
  status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
  },
});

const FlightBookingModel = mongoose.model(
  "FlightBookingModel",
  flightBookingSchema
);
module.exports = FlightBookingModel;
