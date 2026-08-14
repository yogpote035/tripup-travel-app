const axios = require("axios");

const validateEmail = async (email) => {
  console.log("📧 Checking email validity for:", email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn("⚠️ Invalid format.");
    return false;
  }

  const allowedDomains = ["gmail.com", "outlook.com"];
  const domain = email.split("@")[1]?.toLowerCase();
  if (!allowedDomains.includes(domain)) {
    console.warn("⚠️ Domain not allowed:", domain);
    return false;
  }

  // Skip SMTP check if API key is missing or in dev mode to avoid timeout
  if (!process.env.MailBox_API_KEY || process.env.NODE_ENV === "development") {
    console.log("⚠️ Skipping SMTP check (API key missing or dev mode); format check passed");
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const { data } = await axios.get("http://apilayer.net/api/check", {
      params: {
        access_key: process.env.MailBox_API_KEY,
        email,
        smtp: 0,
        format: 1,
      },
      signal: controller.signal,
      timeout: 5000,
    });

    clearTimeout(timeoutId);
    console.log("✅ MailboxLayer response:", data);

    const { format_valid, mx_found, score } = data;
    const isValid = format_valid && mx_found && score > 0.7;

    if (!isValid) {
      console.warn("❌ Rejected by MailboxLayer");
    }

    return isValid;
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      console.warn("⚠️ Email validation API timeout (5s); allowing email");
      return true;
    }
    console.error("❌ MailboxLayer error:", err.message);
    // Allow email on API error to prevent signup failure
    return true;
  }
};

module.exports = validateEmail;
