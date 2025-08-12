const express = require("express");
const router = express.Router();

const postController = require("../../controllers/SocialFeed/SocialFeedController");
const verifyJWE = require("../../Middleware/DecodeToken");
const upload = require("../../Middleware/upload");

//  Create & Get All Posts  Done✅
router.post("/", verifyJWE, upload.array("images"), postController.createPost);
router.get("/", postController.getPosts);
router.get("/my-posts",verifyJWE, postController.getMyPosts);

//  Single Post Operations  Done✅
router.get("/:id", postController.getPost);
router.put("/:id", verifyJWE, upload.array("images"), postController.updatePost);
router.delete("/:id", verifyJWE, postController.deletePost);

//  Post Interactions
router.put("/:id/like", verifyJWE, postController.toggleLike);
router.post("/:id/comments", verifyJWE, postController.addComment);
router.delete("/:postId/comments/:commentId", verifyJWE, postController.deleteComment);


module.exports = router;
