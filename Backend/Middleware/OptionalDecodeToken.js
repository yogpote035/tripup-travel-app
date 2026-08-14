const { verifyAccessToken } = require("../utils/tokenUtils");
module.exports = async (req, res, next) => {
  const header = req.header("Authorization");
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = await verifyAccessToken(header.slice(7));
      req.user = { userId: payload.sub, role: payload.role };
    } catch {}
  }
  next();
};
