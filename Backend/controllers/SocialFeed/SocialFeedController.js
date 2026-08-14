const { id, ta } = require("date-fns/locale");
const cloudinary = require("../../Middleware/cloudinary");
const { sendNotification } = require("../../utils/socket");
const PostModel = require("../../models/SocialFeed/PostModel");
const UserModel = require("../../models/UserModel");

module.exports.createPost = async (req, res) => {
  try {
    console.log("Request in Create Post");

    const { title, description, location, travelDate, visibility, tags } =
      req.body;

    // Upload all files from Multer to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "posts" }),
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    // Save new post in DB
    const author = await UserModel.findById(req.user.userId)
      .select("name profileImage")
      .lean();
    const post = await PostModel.create({
      title,
      description,
      location,
      travelDate: travelDate ? new Date(travelDate) : null,
      images: imageUrls,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      visibility: visibility || "public",
      author: {
        id: req.user.userId,
        name: author?.name || "Traveller",
        profileImage: author?.profileImage || "",
      },
      mentions: (description.match(/@[\w.-]+/g) || []).map((mention) =>
        mention.slice(1),
      ),
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
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));
  const viewer = req.user?.userId;
  const followedAuthors = viewer
    ? (await UserModel.find({ followers: viewer }).select("_id").lean()).map(
      (user) => user._id,
    )
    : [];
  const visibility = viewer
    ? {
      $or: [
        { visibility: "public" },
        { "author.id": viewer },
        { visibility: "followers", "author.id": { $in: followedAuthors } },
      ],
    }
    : { visibility: "public" };
  const [posts, total] = await Promise.all([
    PostModel.find(visibility)
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PostModel.countDocuments(visibility),
  ]);
  res.json({
    data: {
      items: posts,
      pagination: { page, limit, total, hasMore: page * limit < total },
    },
  });
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
  try {
    const id = req.params.id;
    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const viewerId = req.user?.userId;
    if (
      post.visibility === "private" &&
      String(post.author.id) !== String(viewerId)
    )
      return res.status(404).json({ message: "Post not found" });
    if (
      post.visibility === "followers" &&
      String(post.author.id) !== String(viewerId)
    ) {
      const followsAuthor = await UserModel.exists({
        _id: post.author.id,
        followers: viewerId,
      });
      if (!followsAuthor) return res.status(404).json({ message: "Post not found" });
    }
    return res.json(post);
  } catch (err) {
    console.error("Error in getPost:", err);
    return res.status(500).json({ message: "Error fetching post" });
  }
};

// Update post
module.exports.updatePost = async (req, res) => {
  console.log("Request in single Update Post");

  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle image removal
    if (req.body.imagesToRemove && Array.isArray(req.body.imagesToRemove)) {
      const imagesToRemove = req.body.imagesToRemove;

      // Delete from Cloudinary
      for (const imageUrl of imagesToRemove) {
        try {
          // Extract public ID from Cloudinary URL
          const parts = imageUrl.split("/");
          const publicIdWithExt = parts[parts.length - 1];
          const publicId = `posts/${publicIdWithExt.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }

      // Remove from post
      post.images = post.images.filter((img) => !imagesToRemove.includes(img));
    }

    // Upload new images if exists
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "posts" }),
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
      post.images = [...post.images, ...imageUrls];
    }

    // for update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "location",
      "travelDate",
      "tags",
      "visibility",
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

    await post.save();
    console.log("Post updated successfully");

    res.json({
      message: "Post updated successfully",
      id: post._id,
      images: post.images,
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
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
    console.log("Post is Liked: ", !alreadyLiked);
    // notify post author if liked (and not liking own post)
    if (!alreadyLiked && String(post.author.id) !== String(userId)) {
      try {
        await sendNotification(post.author.id, {
          type: "post_liked",
          title: "Post Liked",
          message: `${req.user.userId} liked your post`,
          meta: { postId: post._id },
        });
      } catch (e) {
        console.error("notify error", e.message);
      }
    }
    res.json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};
module.exports.toggleBookmark = async (req, res) => {
  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const userId = req.user.userId;
  const exists = post.bookmarks.some((id) => String(id) === String(userId));
  post.bookmarks = exists
    ? post.bookmarks.filter((id) => String(id) !== String(userId))
    : [...post.bookmarks, userId];
  await post.save();
  return res.json({
    bookmarked: !exists,
    bookmarksCount: post.bookmarks.length,
  });
};
module.exports.getBookmarks = async (req, res) => {
  const posts = await PostModel.find({ bookmarks: req.user.userId })
    .sort({ createdAt: -1 })
    .lean();
  return res.json(posts);
};
module.exports.getLikedPosts = async (req, res) => {
  console.log("Request in Liked Posts");
  try {
    const userId = req.user.userId;
    const posts = await PostModel.find({ likes: userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(posts);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return res.status(500).json({ message: "Error fetching liked posts" });
  }
};
module.exports.trending = async (req, res) => {
  const posts = await PostModel.find({ visibility: "public" })
    .sort({ "likes.length": -1, "comments.length": -1, createdAt: -1 })
    .limit(20)
    .lean();
  return res.json(posts);
};
module.exports.reviewLocation = async (req, res) => {
  const { rating, review } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const user = await UserModel.findById(req.user.userId)
    .select("name profileImage")
    .lean();
  post.locationReviews = post.locationReviews.filter(
    (entry) => String(entry.user.id) !== String(req.user.userId),
  );
  post.locationReviews.push({
    user: {
      id: req.user.userId,
      name: user?.name || "Traveller",
      profileImage: user?.profileImage || "",
    },
    rating,
    review: String(review || "").slice(0, 500),
  });
  post.locationRating =
    post.locationReviews.reduce((sum, entry) => sum + entry.rating, 0) /
    post.locationReviews.length;
  await post.save();
  return res.json({
    locationRating: post.locationRating,
    locationReviews: post.locationReviews,
  });
};
// Add Comment
module.exports.addComment = async (req, res) => {
  console.log("Request Receive in Add Comment");
  try {
    const { text } = req.body;
    console.log("request body: ", req.body);
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commenter = await UserModel.findById(req.user.userId)
      .select("name profileImage")
      .lean();
    const newComment = {
      user: {
        id: req.user.userId,
        name: commenter?.name || "Traveller",
        profileImage: commenter?.profileImage || "",
      },
      text,
    };

    post.comments.unshift(newComment);
    const updatedPost = await post.save();
    // notify post author (if commenter is not author)
    if (String(post.author.id) !== String(req.user.userId)) {
      try {
        await sendNotification(post.author.id, {
          type: "comment_received",
          title: "New Comment",
          message: `${newComment.user.name} commented on your post`,
          meta: { postId: post._id },
        });
      } catch (e) {
        console.error("notify error", e.message);
      }
    }
    res
      .status(200)
      .json({
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
      { new: true },
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
