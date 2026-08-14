const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const PhoneNumberValidator = require("../Middleware/PhoneNumberValidator");

/** Creates the first administrator only when all ADMIN_* environment values are supplied. */
async function ensureBootstrapAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;
  if (![ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD].every(Boolean)) return;

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const phone = PhoneNumberValidator(ADMIN_PHONE);
  if (!phone.isValid || ADMIN_PASSWORD.length < 8) {
    console.error("Initial administrator was not created: invalid ADMIN_* configuration");
    return;
  }

  const existing = await UserModel.findOne({ email })
    || await UserModel.findOne({ phone: phone.formatted });
  if (existing) return;
  await UserModel.create({
    name: ADMIN_NAME.trim(),
    email,
    phone: phone.formatted,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "admin",
    isActive: true,
  });
  console.log("Initial administrator created");
}

module.exports = ensureBootstrapAdmin;
