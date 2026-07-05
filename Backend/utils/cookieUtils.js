function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

function setRefreshTokenCookie(res, token) {
  const options = getRefreshCookieOptions();
  res.cookie("refreshToken", token, options);
}

function clearRefreshTokenCookie(res) {
  const options = getRefreshCookieOptions();
  // To clear, set value to empty and maxAge 0
  res.cookie("refreshToken", "", { ...options, maxAge: 0 });
}

module.exports = { getRefreshCookieOptions, setRefreshTokenCookie, clearRefreshTokenCookie };
