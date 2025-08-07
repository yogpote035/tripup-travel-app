const BusBookingModel = require("../../models/BusBookingModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const TrainBookingModel = require("../../models/TrainBookingModel");
const UserModel = require("../../models/UserModel");
module.exports.UserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.header("userId");

    const user = await UserModel.findById(userId).select("-password");

    let totalTrainBookings = await TrainBookingModel.countDocuments({
      user: userId,
    });
    let totalBusBookings = await BusBookingModel.countDocuments({
      userId: userId,
    });

    let totalFlightBookings = await FlightBookingModel.countDocuments({
      user: userId,
    });

    return res.status(200).json({
      user,
      totalTrainBookings,
      totalBusBookings,
      totalFlightBookings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile info." });
  }
};
