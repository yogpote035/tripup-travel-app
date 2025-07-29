const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../../Middleware/validateEmail");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");
const generateJWE = require("../../Middleware/GenerateToken");

module.exports.Signup = async (request, response) => {
  let { name, email, phone, password } = request.body;
  console.log("signup request body", name, email, password, phone);
  if (!name || !email || !phone || !password) {
    return response.status(406).json({ message: "All Fields Are Required" });
  }

  const result = PhoneNumberValidator(phone);

  if (!result.isValid) {
    return response.status(406).json({ message: "Invalid phone number" });
  }

  const isEmailValid = await validateEmail(email);
  if (!isEmailValid) {
    return response
      .status(406)
      .json({ message: "Email does not appear to be valid." });
  }

  console.log("Before formatted phone from signup ");
  console.log(phone);
  phone = result.formatted; // formate number
  console.log("After formatted phone from signup ");
  console.log(phone);

  const existingPhoneUser = await UserModel.findOne({ phone });

  if (existingPhoneUser) {
    return response
      .status(208)
      .json({ message: "This Phone Number User Already Exists" });
  }

  const existingEmailUser = await UserModel.findOne({ email });

  if (existingEmailUser) {
    return response
      .status(208)
      .json({ message: "This Mail User Already Exists" });
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
    
    console.log("Call going to JWE From Signup");
    const token = await generateJWE(newUser._id.toString());
    console.log("Data Receive From JWE in Signup");

    return response.status(200).json({
      message: "Registration is Successfully Completed",
      token: token,
      userId: newUser._id,
      username: newUser.name,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: `Something Went Wrong : ${error}` });
  }
};

module.exports.Login = async (request, response) => {
  let { email, phone, password } = request.body;

  console.log("Login request body", email ? email : phone, password);

  if ((!email && !phone) || !password) {
    return response.status(203).json({ message: "All Fields Are Required" });
  }
  if (phone) {
    //if phone then
    const result = PhoneNumberValidator(phone);
    if (!result.isValid) {
      return response.status(203).json({ message: "Invalid phone number" });
    }
    console.log("Before formatted phone from signup ");
    console.log(phone);
    phone = result.formatted; // formate number
    console.log("After formatted phone from signup ");
    console.log(phone);
  }

  if (email) {
    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      return response
        .status(203)
        .json({ message: "Email does not appear to be valid." });
    }
  }

  try {
    let existingUser = null;
    if (phone) {
      existingUser = await UserModel.findOne({ phone });
      if (!existingUser) {
        return response
          .status(204)
          .json({ message: "User of This Phone Number Is Not Found" });
      }
    }

    if (!existingUser && email) {
      existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        return response
          .status(204)
          .json({ message: "User of This Email Is Not Found" });
      }
    }

    let passwordCompare = await bcrypt.compare(password, existingUser.password);

    if (!passwordCompare) {
      return response
        .status(208)
        .json({ message: "Wrong password , check your credentials" });
    }
    if (existingUser.role === "admin") {
      return response
        .status(203)
        .json({ message: "You are not General User to access this resource" });
    }
    console.log("Call going to JWE From login");
    const token = await generateJWE(existingUser._id.toString());
    console.log("Data Receive From JWE in Login");

    return response.status(200).json({
      message: "User Logged In successfully",
      token: token,
      userId: existingUser._id,
      username: existingUser.name,
    });
  } catch (error) {
    return response
      .status(500)
      .json({ message: `Something Went Wrong : ${error}` });
  }
};
