const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const PhoneNumberValidator = require("../Middleware/PhoneNumberValidator");

/** 
 * Creates a test user only when all TEST_USER_* environment values are supplied.
 * Ignores if test user already exists (idempotent).
 */
async function ensureBootstrapTestUser() {
    const { TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PHONE, TEST_USER_PASSWORD } = process.env;
    if (![TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PHONE, TEST_USER_PASSWORD].every(Boolean)) return;

    const email = TEST_USER_EMAIL.trim().toLowerCase();
    const phone = PhoneNumberValidator(TEST_USER_PHONE);
    if (!phone.isValid || TEST_USER_PASSWORD.length < 8) {
        console.error("Test user was not created: invalid TEST_USER_* configuration");
        return;
    }

    const existing = await UserModel.findOne({ email })
        || await UserModel.findOne({ phone: phone.formatted });
    if (existing) {
        console.log("Test user already exists - skipping creation");
        return;
    }

    const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 12);
    await UserModel.create({
        name: TEST_USER_NAME.trim(),
        email,
        phone: phone.formatted,
        password: hashedPassword,
        role: "user",
        isActive: true,
    });
    console.log("Test user created successfully");
}

module.exports = ensureBootstrapTestUser;
