const axios = require("axios");

const validateEmail = async (email) => {
  console.log("📧 Checking email validity for:", email);

  // 1. Check format and allowed domains first
  const allowedDomains = ["gmail.com", "outlook.com"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return false;
  }

  try {
    // 2. Validate with MailboxLayer
    const res = await axios.get("http://apilayer.net/api/check", {
      params: {
        access_key: process.env.MailBox_API_KEY,
        email,
        smtp: 1,
        format: 1,
      },
    });

    console.log("✅ Response from MailboxLayer:", res.data);

    const isValid =
      res.data?.format_valid === true &&
      res.data?.mx_found === true &&
      res.data?.smtp_check === true;

    return isValid;
  } catch (err) {
    console.error("❌ Email validation error:", err.message);
    return false;
  }
};

module.exports = validateEmail;
