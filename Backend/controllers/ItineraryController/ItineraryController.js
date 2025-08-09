const ItineraryModel = require("../../models/ItineraryModel");
const generateAIItinerary = require("../../Middleware/generateAIItinerary");

module.exports.createItinerary = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
      interests,
      tripType,
      transportMode,
      budget,
    } = req.body;

    if (
      !destination ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !interests ||
      !tripType ||
      !transportMode ||
      !budget
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const plan = await generateAIItinerary(
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
      interests,
      tripType,
      transportMode,
      budget
    );

    console.log("Ai Generated Itinerary Plan");

    const itinerary = await ItineraryModel.create({
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
      interests,
      tripType,
      transportMode,
      budget,
      plan,
      user: req.user.userId,
    });

    res.status(201).json({ message: "Itinerary created", plan });
  } catch (error) {
    console.error(" Error creating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.FindItinerary = async (req, res) => {
  console.log("Request Receive is Get All Itinerary");
  try {
    if (!req.user.userId) {
      return res.status(406).json({ message: "User Id Not Found" });
    }
    const itinerary = await ItineraryModel.find({ user: req.user.userId }).sort(
      {
        createdAt: -1,
      }
    );
    if (!itinerary.length) {
      return res.status(208).json({ message: "Itinerary Not Found" });
    }
    console.log("itinerary before sent: ");
    // console.log(itinerary);
    res.status(200).json(itinerary);
  } catch (error) {
    console.error(" Error creating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.DeleteItinerary = async (req, res) => {
  try {
    const { id } = req.params; //itinerary id

    if (!req.user.userId) {
      return res.status(406).json({ message: "User Id is Missing" });
    }

    if (!id) {
      return res.status(204).json({ message: "Itinerary Id is Not Found" });
    }

    const itinerary = await ItineraryModel.findById(id);

    if (!itinerary) {
      return res.status(208).json({ message: "Itinerary Not Found" });
    }

    if (String(itinerary.user) !== req.user.userId) {
      return res
        .status(203)
        .json({ message: "Unauthorized to delete this itinerary" });
    }

    await ItineraryModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Itinerary is Deleted Successfully" });
  } catch (error) {
    console.error(" Error creating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
