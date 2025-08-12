const { id, ta } = require("date-fns/locale");
const cloudinary = require("../../Middleware/cloudinary");
const PostModel = require("../../models/SocialFeed/PostModel");

module.exports.createPost = async (req, res) => {
  try {
    console.log("Request in Create Post");

    const { title, description, location, travelDate, visibility, tags } =
      req.body;

    // Upload all files from Multer to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "posts" })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    // Save new post in DB
    const post = await PostModel.create({
      title,
      description,
      location,
      travelDate: travelDate ? new Date(travelDate) : null,
      images: imageUrls,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      visibility: visibility || "public",
      author: { id: req.user.userId },
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all posts
module.exports.getPosts = async (req, res) => {
  console.log("Request in All Posts");
  const posts = await PostModel.find().sort({ createdAt: -1 });
  res.json(posts);
};

// Get My posts
module.exports.getMyPosts = async (req, res) => {
  console.log("Request in My Posts");

  try {
    const userId = req?.user?.userId;
    const posts = await PostModel.find({ "author.id": userId }).sort({
      createdAt: -1,
    });

    // console.log(posts);
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching my posts:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

// Get single post
module.exports.getPost = async (req, res) => {
  console.log("Request in single Post");
  console.log("id is: ", req.params.id);
  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
};

// Update post
module.exports.updatePost = async (req, res) => {
  console.log("Request in single Update Post");

  try {
    let imageUrls = [];

    // Upload new images if exists
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "posts" })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // for update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "location",
      "travelDate",
      "tags",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "tags" && typeof req.body[field] === "string") {
          post[field] = req.body[field]
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        } else {
          post[field] = req.body[field];
        }
      }
    });

    if (imageUrls.length > 0) {
      post.images = [...post.images, ...imageUrls];
    }

    await post.save();
    console.log("Post updated successfully");

    res.json({
      message: "Post updated successfully",
      id: post._id,
    });
  } catch (error) {
    console.error("Error in updatePost:", error);
    res.status(500).json({
      message: "Error updating post",
    });
  }
};

// Delete post
module.exports.deletePost = async (req, res) => {
  console.log("Request in single Delete Post");

  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (post.author.id.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await PostModel.findByIdAndDelete(req.params.id);
  console.log("Post deleted successfully");
  res.json({ message: "Post deleted" });
};

module.exports.toggleLike = async (req, res) => {
  try {
    console.log("Request Receive in Toggle Like");
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.userId;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
    console.log("Post is Liked: ", !alreadyLiked);
    res.json({
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};
// Add Comment
module.exports.addComment = async (req, res) => {
  console.log("Request Receive in Add Comment");
  try {
    const { text, username } = req.body;
    console.log("request body: ", req.body);
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: {
        id: req.user.userId,
        name: username,
      },
      text,
    };

    post.comments.unshift(newComment);
    const updatedPost = await post.save();

    res.status(200).json({
      message: "Comment added successfully",
      comments: updatedPost.comments,
      updatedPost: updatedPost,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

// Delete Comment
module.exports.deleteComment = async (req, res) => {
  console.log("Request Receive in Delete Comment");

  try {
    const { postId, commentId } = req.params;

    // First fetch post for auth check
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow only if comment owner and post owner is same then delete
    if (
      comment.user.id.toString() !== req.user.userId.toString() &&
      post.author.id.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    res.json({
      message: "Comment deleted successfully",
      comments: updatedPost.comments,
      updatedPost: updatedPost,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};
