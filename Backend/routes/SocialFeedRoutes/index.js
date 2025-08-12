const express = require("express");
const router = express.Router();

const postController = require("../../controllers/SocialFeed/SocialFeedController");
const verifyJWE = require("../../Middleware/DecodeToken");
const upload = require("../../Middleware/upload");

//  Create & Get All Posts
router.post("/", verifyJWE, upload.array("images"), postController.createPost);
router.get("/", postController.getPosts);
router.get("/my-posts",verifyJWE, postController.getMyPosts);

//  Single Post Operations
router.get("/:id", postController.getPost);
router.put("/:id", verifyJWE, upload.array("images"), postController.updatePost);
router.delete("/:id", verifyJWE, postController.deletePost);

//  Post Interactions
router.post("/:id/like", verifyJWE, postController.toggleLike);
router.post("/:id/bookmark", verifyJWE, postController.toggleBookmark);
router.post("/:id/comment", verifyJWE, postController.addComment);

module.exports = router;
