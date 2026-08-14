const ItineraryModel = require("../../models/ItineraryModel");
const generateAIItinerary = require("../../Middleware/generateAIItinerary");
const { generateSingleDayPlan } = require("../../Middleware/generateAIItinerary");

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizePayload(body) {
  const payload = body || {};
  return {
    origin: String(payload.origin || "").trim(),
    destination: String(payload.destination || "").trim(),
    startDate: String(payload.startDate || "").trim(),
    endDate: String(payload.endDate || "").trim(),
    startTime: String(payload.startTime || "").trim(),
    endTime: String(payload.endTime || "").trim(),
    interests: Array.isArray(payload.interests) ? payload.interests.filter(Boolean) : [],
    tripType: String(payload.tripType || "").trim(),
    transportMode: String(payload.transportMode || "").trim(),
    budget: String(payload.budget || "").trim(),
  };
}

module.exports.createItinerary = async (req, res) => {
  console.log("[Itinerary Controller] createItinerary reached", {
    requestId: req.requestId,
    userId: req.user?.userId,
    body: req.body,
  });

  try {
    const payload = normalizePayload(req.body);
    const required = ["origin", "destination", "startDate", "endDate", "startTime", "endTime", "interests", "tripType", "transportMode", "budget"];
    const missing = required.filter((field) => {
      if (field === "interests") return !payload.interests.length;
      return !payload[field];
    });

    console.log("[Itinerary Controller] normalized payload", { payload, missing });

    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    console.log("[Itinerary Controller] calling AI generator");
    const aiResult = await generateAIItinerary(payload, { retryCount: 2 });
    const plan = aiResult?.plan || [];
    console.log("[Itinerary Controller] AI result received", { source: aiResult?.source, planCount: Array.isArray(plan) ? plan.length : 0 });

    const itinerary = await ItineraryModel.create({
      origin: payload.origin,
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      interests: payload.interests,
      tripType: payload.tripType,
      transportMode: payload.transportMode,
      budget: payload.budget,
      plan,
      meta: {
        generatedBy: aiResult?.source || "template",
        fallbackReason: aiResult?.fallbackReason || null,
        generatedAt: new Date(),
      },
      user: req.user.userId,
    });

    res.status(201).json({ message: "Itinerary created", plan, itineraryId: itinerary._id, source: aiResult?.source || "template" });
  } catch (error) {
    console.error("Error creating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Simple in-memory cache for paginated results (short TTL)
const cache = new Map();
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

module.exports.FindItinerary = async (req, res) => {
  try {
    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id not found in token" });
    }

    // pagination params (optional)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 10));
    const search = String(req.query.search || "").trim();
    const cacheKey = `${req.user.userId}:${page}:${limit}:${search}`;

    // serve from cache if fresh
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      return res.status(200).json(cached.payload);
    }

    const query = { user: req.user.userId };
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { origin: regex },
        { destination: regex },
        { interests: regex },
        { tripType: regex },
        { transportMode: regex },
      ];
    }

    const total = await ItineraryModel.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const items = await ItineraryModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const payload = { items, total, page, pages };
    cache.set(cacheKey, { ts: Date.now(), payload });

    // Backwards-compatible: if client doesn't request pagination, still return array
    if (!req.query.page && !req.query.limit) {
      return res.status(200).json(items);
    }

    res.status(200).json(payload);
  } catch (error) {
    console.error("Error fetching itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.GetItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Itinerary id is required" });
    }
    const itinerary = await ItineraryModel.findById(id);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary by id:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.UpdateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizePayload(req.body);
    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id not found in token" });
    }
    if (!id) {
      return res.status(400).json({ message: "Itinerary id is required" });
    }
    const itinerary = await ItineraryModel.findOne({ _id: id, user: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    const updates = {
      origin: payload.origin || itinerary.origin,
      destination: payload.destination || itinerary.destination,
      startDate: payload.startDate || itinerary.startDate,
      endDate: payload.endDate || itinerary.endDate,
      startTime: payload.startTime || itinerary.startTime,
      endTime: payload.endTime || itinerary.endTime,
      interests: payload.interests.length ? payload.interests : itinerary.interests,
      tripType: payload.tripType || itinerary.tripType,
      transportMode: payload.transportMode || itinerary.transportMode,
      budget: payload.budget || itinerary.budget,
      updatedAt: new Date(),
    };
    const updated = await ItineraryModel.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Itinerary updated", itinerary: updated });
  } catch (error) {
    console.error("Error updating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.DeleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id is missing in token" });
    }

    if (!id) {
      return res.status(400).json({ message: "Itinerary id is required" });
    }

    const itinerary = await ItineraryModel.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    if (String(itinerary.user) !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this itinerary" });
    }

    await ItineraryModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Itinerary is Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.DuplicateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id not found in token" });
    }
    const itinerary = await ItineraryModel.findOne({ _id: id, user: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    const duplicate = await ItineraryModel.create({
      ...itinerary.toObject(),
      _id: undefined,
      user: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: itinerary.plan ? itinerary.plan.map((day) => ({ ...day })) : [],
    });
    res.status(201).json({ message: "Itinerary duplicated", itinerary: duplicate });
  } catch (error) {
    console.error("Error duplicating itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.ShareItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id not found in token" });
    }
    const itinerary = await ItineraryModel.findOne({ _id: id, user: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json({
      message: "Share link ready",
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/itinerary/${id}`,
      itinerary: {
        _id: itinerary._id,
        destination: itinerary.destination,
        plan: itinerary.plan,
      },
    });
  } catch (error) {
    console.error("Error sharing itinerary:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.RegenerateDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayNumber, date } = req.body || {};
    if (!req.user.userId) {
      return res.status(401).json({ message: "User Id not found in token" });
    }
    const normalizedDayNumber = Number(dayNumber);
    if (!id || !Number.isFinite(normalizedDayNumber) || normalizedDayNumber <= 0) {
      return res.status(400).json({ message: "Itinerary id and valid day number are required" });
    }
    const itinerary = await ItineraryModel.findOne({ _id: id, user: req.user.userId });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    const aiResult = await generateSingleDayPlan({
      origin: itinerary.origin,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      startTime: itinerary.startTime,
      endTime: itinerary.endTime,
      interests: itinerary.interests,
      tripType: itinerary.tripType,
      transportMode: itinerary.transportMode,
      budget: itinerary.budget,
      dayNumber,
      date,
    }, { retryCount: 2 });

    const updatedPlan = Array.isArray(itinerary.plan) ? itinerary.plan.map((day) => ({ ...day })) : [];
    const index = updatedPlan.findIndex((day) => Number(day.day) === Number(dayNumber));
    if (index >= 0) {
      updatedPlan[index] = aiResult?.plan || updatedPlan[index];
    } else {
      updatedPlan.push(aiResult?.plan || { day: dayNumber, activities: [] });
    }

    const updated = await ItineraryModel.findByIdAndUpdate(id, { plan: updatedPlan }, { new: true });
    res.status(200).json({ message: "Day regenerated", itinerary: updated, source: aiResult?.source || "template" });
  } catch (error) {
    console.error("Error regenerating itinerary day:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
