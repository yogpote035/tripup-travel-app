const TrainBookingModel = require("../../models/TrainBookingModel");
const UserModel = require("../../models/UserModel");

module.exports.UserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.header("userId");

    const user = await UserModel.findById(userId).select("-password");

    let totalBookings = await TrainBookingModel.countDocuments({
      user: userId,
    });

    return res.status(200).json({
      user,
      totalBookings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile info." });
  }
};
