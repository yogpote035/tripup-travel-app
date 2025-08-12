const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainNumber: {
      type: String,
      required: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    coachType: {
      type: String,
      required: true,
    },
    seatNumbers: {
      type: [Number],
      required: true,
    },
    passengerNames: {
      type: [String],
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
    journeyDate: {
      type: Date,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const TrainBookingModel = mongoose.model("TrainBookingModel", bookingSchema);
module.exports = TrainBookingModel;
