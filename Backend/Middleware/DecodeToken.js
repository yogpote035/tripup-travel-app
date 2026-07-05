const { verifyAccessToken } = require("../utils/tokenUtils");

async function verifyJWE(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ code: "ACCESS_TOKEN_MISSING", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return res.status(401).json({ code: "ACCESS_TOKEN_INVALID", message: "Invalid token payload" });
    }
    req.user = { userId: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Map jose errors to safe error codes
    const code = err.code || (err.name === "JWTExpired" ? "ACCESS_TOKEN_EXPIRED" : "ACCESS_TOKEN_INVALID");
    return res.status(401).json({ code, message: "Invalid or expired access token" });
  }
}

module.exports = verifyJWE;
