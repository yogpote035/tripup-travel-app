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

  try {
    const { data } = await axios.get("http://apilayer.net/api/check", {
      params: {
        access_key: process.env.MailBox_API_KEY,
        email,
        smtp: 1,
        format: 1,
      },
    });

    console.log("✅ MailboxLayer response:", data);

    const { format_valid, mx_found, smtp_check, score } = data;

    const isValid = format_valid && mx_found && (smtp_check || score > 0.7);

    if (!isValid) {
      console.warn("❌ Rejected by MailboxLayer");
    }

    return isValid;
  } catch (err) {
    console.error("❌ MailboxLayer error:", err.message);

    return true;
  }
};

module.exports = validateEmail;
