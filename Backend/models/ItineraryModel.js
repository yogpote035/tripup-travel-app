const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    interests: [String],
    tripType: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String, // ✅ FIXED
      required: true,
    },
    transportMode: {
      type: String, // ✅ FIXED
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    plan: Object, // AI-generated day-wise plan
  },
  { timestamps: true }
);

const ItineraryModel = mongoose.model("ItineraryModel", itinerarySchema);
module.exports = ItineraryModel;
