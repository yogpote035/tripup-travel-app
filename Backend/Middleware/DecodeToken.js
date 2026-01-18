const { jwtDecrypt } = require("jose");

const decoder = new TextEncoder();
const secret = decoder.encode(process.env.SECRET.slice(0, 32));

async function verifyJWE(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtDecrypt(token, secret);
    req.user = payload; // contains userId
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyJWE;
