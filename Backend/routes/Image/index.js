const express = require("express");
const router = express.Router();
const { optimizeImage } = require("../../controllers/ImageController");
const verifyJWE = require("../../Middleware/DecodeToken");

/**
 * @openapi
 * /api/images/optimize:
 *   post:
 *     tags: [Images]
 *     summary: Optimize an image
 *     description: Optimizes an image URL or upload payload and returns a processed image link.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageOptimizeRequest'
 *     responses:
 *       200:
 *         description: Image optimized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageOptimizeResponse'
 *       400:
 *         description: Invalid request payload.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
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
router.post("/optimize", verifyJWE, optimizeImage);

module.exports = router;
