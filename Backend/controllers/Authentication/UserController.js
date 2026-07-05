const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const validateEmail = require("../../Middleware/validateEmail");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");
const { v4: uuidv4 } = require("uuid");
const SessionModel = require("../../models/SessionModel");
const { hashToken } = require("../../utils/hashToken");
const { generateAccessToken, generateRefreshToken } = require("../../utils/tokenUtils");
const { setRefreshTokenCookie } = require("../../utils/cookieUtils");

module.exports.Signup = async (request, response) => {
  let { name, email, phone, password } = request.body;
  console.log("signup request body", name, email, password, phone);
  if (!name || !email || !phone || !password) {
    return response.status(400).json({ message: "All fields are required" });
  }

  const result = PhoneNumberValidator(phone);

  if (!result.isValid) {
    return response.status(400).json({ message: "Invalid phone number" });
  }

  const isEmailValid = await validateEmail(email);
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

  const existingEmailUser = await UserModel.findOne({ email });

  if (existingEmailUser) {
    return response.status(409).json({ message: "Email already in use" });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
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

  console.log("Login request body", email ? email : phone, password);

  if ((!email && !phone) || !password) {
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

  if (email) {
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

    if (!existingUser && email) {
      existingUser = await UserModel.findOne({ email });
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
