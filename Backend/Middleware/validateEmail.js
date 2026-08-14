const axios = require("axios");

const validateEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  console.log("📧 Checking email validity for:", normalizedEmail);

  if (!normalizedEmail) {
    console.warn("⚠️ Email is empty.");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    console.warn("⚠️ Invalid email format.");
    return false;
  }

  const domain = normalizedEmail.split("@")[1];
  if (!domain || domain.split(".").length < 2) {
    console.warn("⚠️ Invalid email domain:", domain);
    return false;
  }

  // Skip SMTP check if API key is missing or in dev mode to avoid timeout.
  // We still do format validation in those cases, but do not reject valid addresses.
  if (!process.env.MailBox_API_KEY || process.env.NODE_ENV === "development") {
    console.log("⚠️ Skipping SMTP check (API key missing or dev mode); format check passed");
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { data } = await axios.get("http://apilayer.net/api/check", {
      params: {
        access_key: process.env.MailBox_API_KEY,
        email: normalizedEmail,
        smtp: 0,
        format: 1,
      },
      signal: controller.signal,
      timeout: 5000,
    });

    clearTimeout(timeoutId);
    console.log("✅ MailboxLayer response:", data);

    const { format_valid, mx_found, free, score } = data || {};

    // Valid Gmail/Outlook/other real addresses can legitimately have a score below 0.7.
    // We therefore treat format_valid + a real domain / MX as sufficient, and allow a
    // low score rather than rejecting a valid mailbox.
    const isValid = Boolean(
      format_valid &&
      (mx_found || free || Number(score) >= 0.5)
    );

    if (!isValid) {
      console.warn("❌ Rejected by MailboxLayer", { format_valid, mx_found, free, score });
    }

    return isValid;
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      console.warn("⚠️ Email validation API timeout (5s); allowing email");
      return true;
    }

    console.error("❌ MailboxLayer error:", err.message);
    return true;
  }
};

module.exports = validateEmail;
