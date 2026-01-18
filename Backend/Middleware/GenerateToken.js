const { EncryptJWT } = require("jose");
const encoder = new TextEncoder();

async function generateJWE(userId) {
  const raw = process.env.SECRET.slice(0, 32);
  const secret = encoder.encode(raw);

  console.log("Call Receive in JWE");

  const jwe = await new EncryptJWT({ userId })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("3d")
    .encrypt(secret);

  console.log("From JWE:Call  DONE");
  return jwe;
}

module.exports = generateJWE;
