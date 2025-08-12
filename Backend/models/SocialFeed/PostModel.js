const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
      },
      name: String,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    travelDate: { type: Date, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
      },
      name: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("PostModel", postSchema);
module.exports = PostModel;
