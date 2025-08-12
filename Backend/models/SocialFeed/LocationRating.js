import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        stars: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const LocationRatingModel = mongoose.model("LocationRating", ratingSchema);
module.exports = LocationRatingModel;
