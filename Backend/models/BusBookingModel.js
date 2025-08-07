const mongoose = require("mongoose");

const BusBookingSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusModel",
    required: true,
  },
  journeyDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  source: String,
  destination: String,
  distance: Number,
  farePerSeat: Number,
  totalFare: Number,

  passengers: [
    {
      name: String,
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      seatNumber: Number,
      email: String,
      phone: String,
    },
  ],

  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
  },
});

const BusBookingModel = mongoose.model("BusBookingModel", BusBookingSchema);
module.exports = BusBookingModel;
