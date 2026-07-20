const UserModel = require("../models/UserModel");

/** Restricts a verified request to active administrators. */
async function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ code: "ADMIN_ACCESS_REQUIRED", message: "Administrator access is required" });
  }
  const admin = await UserModel.findOne({ _id: req.user.userId, role: "admin", isActive: { $ne: false } }).select("_id").lean();
  if (!admin) return res.status(403).json({ code: "ADMIN_ACCOUNT_INACTIVE", message: "Administrator account is inactive" });
  return next();
}

module.exports = requireAdmin;
