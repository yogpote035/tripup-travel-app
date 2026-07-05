const express = require("express");
const router = express.Router();
const {
  Signup,
  Login,
} = require("../../controllers/Authentication/UserController");
const {
  refresh,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
} = require("../../controllers/Authentication/AuthController");

router.post("/signup", Signup);
router.post("/login", Login);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.get("/sessions", getSessions);
router.delete("/sessions/:sessionId", revokeSession);

module.exports = router;