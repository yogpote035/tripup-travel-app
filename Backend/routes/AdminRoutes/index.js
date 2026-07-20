const express = require("express");
const verifyJWE = require("../../Middleware/DecodeToken");
const requireAdmin = require("../../Middleware/RequireAdmin");
const admin = require("../../controllers/AdminController/AdminController");
const router = express.Router();

router.use(verifyJWE, requireAdmin);
router.get("/dashboard", admin.getDashboard);
router.get("/users", admin.getUsers);
router.patch("/users/:id/status", admin.updateUserStatus);
router.get("/admins", admin.getAdmins);
router.post("/admins", admin.createAdmin);
router.patch("/admins/:id/status", admin.updateAdminStatus);
router.get("/bookings", admin.getBookings);
router.get("/posts", admin.getPosts);
router.delete("/posts/:id", admin.deletePost);
module.exports = router;
