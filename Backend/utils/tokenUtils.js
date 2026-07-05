const { SignJWT, jwtVerify } = require("jose");

const encoder = new TextEncoder();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET environment variables");
}

const accessSecret = encoder.encode(ACCESS_TOKEN_SECRET);
const refreshSecret = encoder.encode(REFRESH_TOKEN_SECRET);

async function generateAccessToken(user) {
  const jwt = await new SignJWT({ role: user.role, type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(accessSecret);
  return jwt;
}

async function generateRefreshToken(user, sessionId, familyId) {
  const jwt = await new SignJWT({ sid: sessionId, familyId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(refreshSecret);
  return jwt;
}

async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, accessSecret);
  if (!payload || payload.type !== "access") {
    const err = new Error("Invalid access token type");
    err.code = "ACCESS_TOKEN_INVALID";
    throw err;
  }
  return payload;
}

async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, refreshSecret);
  if (!payload || payload.type !== "refresh") {
    const err = new Error("Invalid refresh token type");
    err.code = "REFRESH_TOKEN_INVALID";
    throw err;
  }
  return payload;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
