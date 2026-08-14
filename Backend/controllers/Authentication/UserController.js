const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const validateEmail = require("../../Middleware/validateEmail");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");
const { v4: uuidv4 } = require("uuid");
const SessionModel = require("../../models/SessionModel");
const { hashToken } = require("../../utils/hashToken");
const { generateAccessToken, generateRefreshToken, generatePasswordResetToken, verifyPasswordResetToken } = require("../../utils/tokenUtils");
const { setRefreshTokenCookie } = require("../../utils/cookieUtils");
const ensureBootstrapAdmin = require("../../utils/bootstrapAdmin");
const { sendMail, buildPasswordResetEmail } = require("../../utils/mailService");

async function sendPasswordResetEmail(targetEmail, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const emailContent = buildPasswordResetEmail(resetLink);
  await sendMail({
    to: targetEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
}

module.exports.Signup = async (request, response) => {
  let { name, email, phone, password } = request.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  console.log("signup request body", name, normalizedEmail, password, phone);
  if (!name || !normalizedEmail || !phone || !password) {
    return response.status(400).json({ message: "All fields are required" });
  }

  const result = PhoneNumberValidator(phone);

  if (!result.isValid) {
    return response.status(400).json({ message: "Invalid phone number" });
  }

  const isEmailValid = await validateEmail(normalizedEmail);
  if (!isEmailValid) {
    return response.status(400).json({ message: "Email does not appear to be valid." });
  }

  console.log("Before formatted phone from signup ");
  console.log(phone);
  phone = result.formatted; // formate number
  console.log("After formatted phone from signup ");
  console.log(phone);

  const existingPhoneUser = await UserModel.findOne({ phone });

  if (existingPhoneUser) {
    return response.status(409).json({ message: "Phone number already in use" });
  }

  const existingEmailUser = await UserModel.findOne({ email: normalizedEmail });

  if (existingEmailUser) {
    return response.status(409).json({ message: "Email already in use" });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "user", // default role
    });
    await newUser.save();
    console.log("New User is Created");
    // create session and tokens
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshToken = await generateRefreshToken(newUser, sessionId, familyId);
    const refreshHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = new SessionModel({
      _id: sessionId,
      userId: newUser._id,
      refreshTokenHash: refreshHash,
      familyId,
      userAgent: request.get("User-Agent") || null,
      ipAddress: request.ip,
      expiresAt,
    });
    await session.save();

    const accessToken = await generateAccessToken(newUser);
    setRefreshTokenCookie(response, refreshToken);

    return response.status(201).json({
      message: "Registration completed",
      data: {
        user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        accessToken,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: `Something went wrong` });
  }
};

module.exports.Login = async (request, response) => {
  let { email, phone, password } = request.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  console.log("Login request body", normalizedEmail || phone, password);

  if ((!normalizedEmail && !phone) || !password) {
    return response.status(400).json({ message: "All fields are required" });
  }
  if (phone) {
    //if phone then
    const result = PhoneNumberValidator(phone);
    if (!result.isValid) {
      return response.status(400).json({ message: "Invalid phone number" });
    }
    console.log("Before formatted phone from signup ");
    console.log(phone);
    phone = result.formatted; // formate number
    console.log("After formatted phone from signup ");
    console.log(phone);
  }

  if (normalizedEmail) {
    // const isEmailValid = await validateEmail(email);
    // if (!isEmailValid) {
    //   return response
    //     .status(203)
    //     .json({ message: "Email does not appear to be valid." });
    // }
  }

  try {
    let existingUser = null;
    if (phone) {
      existingUser = await UserModel.findOne({ phone });
      if (!existingUser) {
        return response.status(404).json({ message: "User not found" });
      }
    }

    if (!existingUser && normalizedEmail) {
      existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (!existingUser) {
        return response.status(404).json({ message: "User not found" });
      }
    }

    let passwordCompare = await bcrypt.compare(password, existingUser.password);

    if (!passwordCompare) {
      return response.status(401).json({ message: "Invalid credentials" });
    }
    if (existingUser.role === "admin") {
      return response.status(403).json({ message: "Forbidden" });
    }

    // create session and rotate tokens
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshToken = await generateRefreshToken(existingUser, sessionId, familyId);
    const refreshHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = new SessionModel({
      _id: sessionId,
      userId: existingUser._id,
      refreshTokenHash: refreshHash,
      familyId,
      userAgent: request.get("User-Agent") || null,
      ipAddress: request.ip,
      expiresAt,
    });
    await session.save();

    const accessToken = await generateAccessToken(existingUser);
    setRefreshTokenCookie(response, refreshToken);

    return response.status(200).json({
      message: "User logged in",
      data: {
        user: { _id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role },
        accessToken,
      },
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: `Something went wrong` });
  }
};

module.exports.ForgotPassword = async (request, response) => {
  const email = String(request.body?.email || "").trim().toLowerCase();
  if (!email) return response.status(400).json({ message: "Email is required" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(200).json({
        message: "If an account exists for that email, a reset link has been prepared.",
      });
    }

    const resetToken = await generatePasswordResetToken(user);
    await sendPasswordResetEmail(email, resetToken);
    return response.status(200).json({
      message: "If an account exists for that email, a reset link has been prepared.",
      data: process.env.NODE_ENV !== "production" ? { resetToken } : undefined,
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return response.status(500).json({ message: "Unable to process password reset request" });
  }
};

module.exports.ResetPassword = async (request, response) => {
  const { token, password } = request.body || {};
  if (!token || !password) return response.status(400).json({ message: "A reset token and a new password are required" });
  if (String(password).length < 8) return response.status(400).json({ message: "Password must contain at least 8 characters" });

  try {
    const payload = await verifyPasswordResetToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user) return response.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    return response.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error", error);
    return response.status(400).json({ message: "Invalid or expired reset token" });
  }
};

/** Authenticates an administrator without changing the customer login contract. */
module.exports.AdminLogin = async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) return response.status(400).json({ message: "Email and password are required" });

  try {
    await ensureBootstrapAdmin();
    const admin = await UserModel.findOne({ email: email.trim().toLowerCase(), role: "admin" });
    if (!admin || admin.isActive === false || !(await bcrypt.compare(password, admin.password))) {
      return response.status(401).json({ message: "Invalid administrator credentials" });
    }

    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshToken = await generateRefreshToken(admin, sessionId, familyId);
    await new SessionModel({
      _id: sessionId,
      userId: admin._id,
      refreshTokenHash: hashToken(refreshToken),
      familyId,
      userAgent: request.get("User-Agent") || null,
      ipAddress: request.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();
    setRefreshTokenCookie(response, refreshToken);
    const accessToken = await generateAccessToken(admin);
    return response.status(200).json({
      message: "Administrator logged in",
      data: { user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }, accessToken },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return response.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Unable to sign in"
          : error.message || "Unable to sign in",
    });
  }
};
