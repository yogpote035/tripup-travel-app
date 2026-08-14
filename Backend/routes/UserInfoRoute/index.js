const express = require("express");

const router = express.Router();
const { UserProfile, getRecentActivity } = require("../../controllers/User/UserController");

const verifyJWE = require("../../Middleware/DecodeToken");

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile and booking statistics.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
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
router.get("/profile", verifyJWE, UserProfile);

/**
 * @openapi
 * /api/user/recent-activity:
 *   get:
 *     tags: [Users]
 *     summary: Get recent user activity
 *     description: Returns the latest activity items for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity list returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
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
router.get("/recent-activity", verifyJWE, getRecentActivity);

module.exports = router;
