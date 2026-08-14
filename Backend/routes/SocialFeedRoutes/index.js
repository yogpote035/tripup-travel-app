const express = require("express");
const router = express.Router();

const postController = require("../../controllers/SocialFeed/SocialFeedController");
const verifyJWE = require("../../Middleware/DecodeToken");
const optionalDecode = require("../../Middleware/OptionalDecodeToken");
const upload = require("../../Middleware/upload");

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags: [Social Feed]
 *     summary: Create a new post
 *     description: Creates a social post with optional image uploads.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               travelDate:
 *                 type: string
 *               visibility:
 *                 type: string
 *               tags:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyJWE, upload.array("images"), postController.createPost);

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Social Feed]
 *     summary: List posts
 *     description: Returns public posts and optionally follower-only content for authenticated viewers.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post list returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", optionalDecode, postController.getPosts);

/**
 * @openapi
 * /api/posts/trending:
 *   get:
 *     tags: [Social Feed]
 *     summary: Get trending posts
 *     description: Returns posts sorted by engagement.
 *     responses:
 *       200:
 *         description: Trending posts returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/trending", postController.trending);

/**
 * @openapi
 * /api/posts/bookmarks:
 *   get:
 *     tags: [Social Feed]
 *     summary: Get bookmarked posts
 *     description: Returns posts bookmarked by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmarked posts returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/bookmarks", verifyJWE, postController.getBookmarks);
router.get("/likes", verifyJWE, postController.getLikedPosts);

/**
 * @openapi
 * /api/posts/my-posts:
 *   get:
 *     tags: [Social Feed]
 *     summary: Get current user's posts
 *     description: Returns all posts authored by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User posts returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/my-posts", verifyJWE, postController.getMyPosts);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     tags: [Social Feed]
 *     summary: Get a single post
 *     description: Returns a specific post by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", optionalDecode, postController.getPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     tags: [Social Feed]
 *     summary: Update a post
 *     description: Updates an existing post if the authenticated user is the author.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: User is not authorized to edit the post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyJWE, upload.array("images"), postController.updatePost);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     tags: [Social Feed]
 *     summary: Delete a post
 *     description: Deletes an existing post if the authenticated user is the author.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: User is not authorized to delete the post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", verifyJWE, postController.deletePost);

/**
 * @openapi
 * /api/posts/{id}/like:
 *   put:
 *     tags: [Social Feed]
 *     summary: Toggle a like on a post
 *     description: Adds or removes the authenticated user's like from a post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id/like", verifyJWE, postController.toggleLike);

/**
 * @openapi
 * /api/posts/{id}/bookmark:
 *   put:
 *     tags: [Social Feed]
 *     summary: Toggle a bookmark on a post
 *     description: Adds or removes the authenticated user's bookmark from a post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id/bookmark", verifyJWE, postController.toggleBookmark);

/**
 * @openapi
 * /api/posts/{id}/location-review:
 *   post:
 *     tags: [Social Feed]
 *     summary: Submit a location review for a post
 *     description: Adds or updates a location rating and review for a post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid rating value.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/location-review", verifyJWE, postController.reviewLocation);

/**
 * @openapi
 * /api/posts/{id}/comments:
 *   post:
 *     tags: [Social Feed]
 *     summary: Add a comment to a post
 *     description: Adds a comment to the specified post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/comments", verifyJWE, postController.addComment);

/**
 * @openapi
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     tags: [Social Feed]
 *     summary: Delete a comment
 *     description: Deletes a comment if the authenticated user is the author or post owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: User is not authorized to delete the comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post or comment not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:postId/comments/:commentId", verifyJWE, postController.deleteComment);

module.exports = router;
