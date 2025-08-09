const express = require("express");
const router = express.Router();
const {
  createItinerary,
  DeleteItinerary,
  FindItinerary,
} = require("../../controllers/ItineraryController/ItineraryController");
const verifyJWE = require("../../Middleware/DecodeToken");

// Create a new itinerary (AI-generated)
router.post("/generate", verifyJWE, createItinerary);

router.get("/get-all", verifyJWE, FindItinerary);

// router.get("/:id", verifyJWE, getItineraryById);

router.delete("/delete/:id", verifyJWE, DeleteItinerary);

module.exports = router;
