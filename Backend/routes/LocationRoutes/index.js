const express = require("express");
const DecodeToken = require("../../Middleware/DecodeToken");
const LocationController = require("../../controllers/Location/LocationController");

const router = express.Router();

// Create a location by name if it does not exist
router.post("/", DecodeToken, LocationController.createLocation);

// Get all locations with search and filters
router.get("/", LocationController.getLocations);

// Search locations
router.get("/search", LocationController.searchLocations);

// Get popular locations
router.get("/popular", LocationController.getPopularLocations);

// Get single location detail
router.get("/:id", LocationController.getLocationDetail);

// Get posts for a location
router.get("/:id/posts", LocationController.getLocationPosts);

// Get reviews for a location
router.get("/:id/reviews", LocationController.getLocationReviews);

// Add review to location (requires auth)
router.post("/:id/reviews", DecodeToken, LocationController.addLocationReview);

// Mark user as visitor
router.post("/:id/visitor", DecodeToken, LocationController.markVisitor);

module.exports = router;
