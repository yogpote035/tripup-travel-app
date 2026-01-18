const express = require("express");
const router = express.Router();
const {
  Signup,
  Login,
  generateRefreshToken,
} = require("../../controllers/Authentication/UserController");
const verifyJWE = require("../../Middleware/DecodeToken");
router.post("/signup", Signup);
router.post("/login", Login);
// router.post("/refresh-token", verifyJWE, generateRefreshToken);
router.post("/refresh-token", generateRefreshToken);

module.exports = router;