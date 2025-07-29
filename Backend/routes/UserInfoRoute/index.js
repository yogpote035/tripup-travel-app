const express = require("express");

const router = express.Router();
const { UserProfile } = require("../../controllers/User/UserController");

const verifyJWE = require("../../Middleware/DecodeToken");

router.get("/profile", verifyJWE, UserProfile);

module.exports = router;
