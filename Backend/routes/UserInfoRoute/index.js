const express = require("express");

const router = express.Router();
const { UserProfile, getRecentActivity } = require("../../controllers/User/UserController");

const verifyJWE = require("../../Middleware/DecodeToken");

router.get("/profile", verifyJWE, UserProfile);
router.get("/recent-activity", verifyJWE, getRecentActivity);

module.exports = router;
