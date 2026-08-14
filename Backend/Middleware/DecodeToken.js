const { verifyAccessToken } = require("../utils/tokenUtils");
const { logger } = require("./Logger");

async function verifyJWE(req, res, next) {
  const authHeader = req.header("Authorization");
  const requestInfo = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  };

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Unauthorized request: missing bearer token", requestInfo);
    return res.status(401).json({ code: "ACCESS_TOKEN_MISSING", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      logger.warn("Unauthorized request: invalid token payload", requestInfo);
      return res.status(401).json({ code: "ACCESS_TOKEN_INVALID", message: "Invalid token payload" });
    }
    req.user = { userId: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Map jose errors to safe error codes
    const code = err.code || (err.name === "JWTExpired" ? "ACCESS_TOKEN_EXPIRED" : "ACCESS_TOKEN_INVALID");
    logger.warn("Unauthorized request: invalid or expired token", { ...requestInfo, code, message: err.message });
    return res.status(401).json({ code, message: "Invalid or expired access token" });
  }
}

module.exports = verifyJWE;
