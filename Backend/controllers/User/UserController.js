const BusBookingModel = require("../../models/BusBookingModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const ItineraryModel = require("../../models/ItineraryModel");
const PostModel = require("../../models/SocialFeed/PostModel");
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
    let totalPosts = await PostModel.countDocuments({
      "author.id": userId,
    });
    let totalPlans = await ItineraryModel.countDocuments({
      user: userId,
    });

    return res.status(200).json({
      user,
      totalTrainBookings,
      totalBusBookings,
      totalFlightBookings,
      totalPosts,
      totalPlans,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile info." });
  }
};
module.exports.getRecentActivity = async (req, res) => {
  console.log("received request for recent activity");
  try {
    const userId = req.user?.userId || req.header("userId");

    const [trainBookings, busBookings, flightBookings, plans, posts] =
      await Promise.all([
        TrainBookingModel.find({ user: userId })
          .select("_id createdAt trainName")
          .sort({ createdAt: -1 })
          .limit(1)
          .lean(),

        BusBookingModel.find({ userId: userId })
          .select("_id createdAt destination busName")
          .sort({ createdAt: -1 })
          .limit(1)
          .lean(),

        FlightBookingModel.find({ user: userId })
          .select("_id createdAt to flightName")
          .sort({ createdAt: -1 })
          .limit(1)
          .lean(),

        ItineraryModel.find({ user: userId })
          .select("_id createdAt destination")
          .sort({ createdAt: -1 })
          .limit(1)
          .lean(),

        PostModel.find({ "author.id": userId })
          .select("_id createdAt title")
          .sort({ createdAt: -1 })
          .limit(1)
          .lean(),
      ]);

    const activities = [
      ...trainBookings.map((t) => ({
        type: "train",
        title: t.trainName,
        createdAt: t.createdAt,
        id: t._id,
      })),
      ...busBookings.map((b) => ({
        type: "bus",
        title: b.busName || b.destination,
        createdAt: b.createdAt,
        id: b._id,
      })),
      ...flightBookings.map((f) => ({
        type: "flight",
        title: f.flightName || f.to,
        createdAt: f.createdAt,
        id: f._id,
      })),
      ...plans.map((p) => ({
        type: "plan",
        title: p.destination,
        createdAt: p.createdAt,
        id: p._id,
      })),
      ...posts.map((po) => ({
        type: "post",
        title: po.title,
        createdAt: po.createdAt,
        id: po._id,
      })),
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ recentActivity: activities.slice(0, 10) });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
};
