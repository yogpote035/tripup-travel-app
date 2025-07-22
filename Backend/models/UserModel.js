const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user", // 'user' or 'admin'
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("UserModel", UserSchema);
module.exports = UserModel;
