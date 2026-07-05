const { v4: uuidv4 } = require("uuid");
const SessionModel = require("../../models/SessionModel");
const UserModel = require("../../models/UserModel");
const { hashToken } = require("../../utils/hashToken");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/tokenUtils");
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require("../../utils/cookieUtils");

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const raw = req.cookies && req.cookies.refreshToken;
    if (!raw) return res.status(401).json({ code: "REFRESH_TOKEN_MISSING", message: "Refresh token missing" });

    let payload;
    try {
      payload = await verifyRefreshToken(raw);
    } catch (err) {
      return res.status(401).json({ code: "REFRESH_TOKEN_INVALID", message: "Invalid refresh token" });
    }

    const { sub: userId, sid: sessionId, familyId } = payload;

    const presentedHash = hashToken(raw);

    // Atomically find and mark the session as consumed (revoked) only if hash matches and not revoked and not expired
    const now = new Date();
    const session = await SessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
        familyId,
        refreshTokenHash: presentedHash,
        isRevoked: false,
        expiresAt: { $gt: now },
      },
      { $set: { isRevoked: true, revokedAt: now, revokeReason: "ROTATED" } },
      { new: true }
    );

    if (!session) {
      // Possible reuse or already consumed -> revoke family
      await SessionModel.updateMany({ familyId }, { $set: { isRevoked: true, revokedAt: new Date(), revokeReason: "REFRESH_TOKEN_REUSE" } });
      clearRefreshTokenCookie(res);
      return res.status(401).json({ code: "REFRESH_TOKEN_REUSE_DETECTED", message: "Refresh token reuse detected" });
    }

    // Create new session (rotation)
    const newSessionId = uuidv4();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newRefreshToken = await generateRefreshToken({ _id: userId.toString() }, newSessionId, familyId);
    const newHash = hashToken(newRefreshToken);

    const newSession = new SessionModel({
      _id: newSessionId,
      userId,
      refreshTokenHash: newHash,
      familyId,
      userAgent: req.get("User-Agent") || null,
      ipAddress: req.ip,
      expiresAt: newExpiresAt,
    });
    await newSession.save();

    // generate access token
    const user = await UserModel.findById(userId).lean();
    const role = user?.role || "user";
    const accessToken = await generateAccessToken({ _id: userId, role });

    // set cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    console.error("Refresh error", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const raw = req.cookies && req.cookies.refreshToken;
    if (raw) {
      try {
        const payload = await verifyRefreshToken(raw);
        const { sid: sessionId } = payload;
        await SessionModel.findByIdAndUpdate(sessionId, { $set: { isRevoked: true, revokedAt: new Date(), revokeReason: "USER_LOGOUT" } });
      } catch (e) {
        // ignore verification errors for idempotency
      }
    }
    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error", err);
    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: "Logged out" });
  }
}

// POST /api/auth/logout-all
async function logoutAll(req, res) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ code: "ACCESS_TOKEN_MISSING", message: "Missing access token" });
    const token = authHeader.split(" ")[1];
    // verify access token without importing full tokenUtils.verifyAccessToken to avoid cycle; use jwtVerify here
    const { jwtVerify } = require("jose");
    const encoder = new TextEncoder();
    const accessSecret = encoder.encode(process.env.ACCESS_TOKEN_SECRET);
    let payload;
    try {
      const v = await jwtVerify(token, accessSecret);
      payload = v.payload;
    } catch (e) {
      return res.status(401).json({ code: "ACCESS_TOKEN_INVALID", message: "Invalid access token" });
    }
    const userId = payload.sub;
    await SessionModel.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true, revokedAt: new Date(), revokeReason: "LOGOUT_ALL" } });
    clearRefreshTokenCookie(res);
    return res.status(200).json({ success: true, message: "Logged out from all devices" });
  } catch (err) {
    console.error("Logout all error", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/auth/sessions
async function getSessions(req, res) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ code: "ACCESS_TOKEN_MISSING", message: "Missing access token" });
    const token = authHeader.split(" ")[1];
    const { jwtVerify } = require("jose");
    const encoder = new TextEncoder();
    const accessSecret = encoder.encode(process.env.ACCESS_TOKEN_SECRET);
    let payload;
    try {
      const v = await jwtVerify(token, accessSecret);
      payload = v.payload;
    } catch (e) {
      return res.status(401).json({ code: "ACCESS_TOKEN_INVALID", message: "Invalid access token" });
    }
    const userId = payload.sub;
    const sessions = await SessionModel.find({ userId }).select("_id userAgent ipAddress createdAt lastUsedAt expiresAt isRevoked revokedAt revokeReason").lean();
    return res.status(200).json({ success: true, data: { sessions } });
  } catch (err) {
    console.error("Get sessions error", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// DELETE /api/auth/sessions/:sessionId
async function revokeSession(req, res) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ code: "ACCESS_TOKEN_MISSING", message: "Missing access token" });
    const token = authHeader.split(" ")[1];
    const { jwtVerify } = require("jose");
    const encoder = new TextEncoder();
    const accessSecret = encoder.encode(process.env.ACCESS_TOKEN_SECRET);
    let payload;
    try {
      const v = await jwtVerify(token, accessSecret);
      payload = v.payload;
    } catch (e) {
      return res.status(401).json({ code: "ACCESS_TOKEN_INVALID", message: "Invalid access token" });
    }
    const userId = payload.sub;
    const { sessionId } = req.params;
    const session = await SessionModel.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.userId.toString() !== userId) return res.status(403).json({ message: "Forbidden" });
    session.isRevoked = true;
    session.revokedAt = new Date();
    session.revokeReason = "USER_REVOKED_SESSION";
    await session.save();
    return res.status(200).json({ success: true, message: "Session revoked" });
  } catch (err) {
    console.error("Revoke session error", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = {
  refresh,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
};
