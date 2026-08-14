const express = require("express");
const router = express.Router();
const {
  createItinerary,
  DeleteItinerary,
  FindItinerary,
  GetItineraryById,
  UpdateItinerary,
  DuplicateItinerary,
  ShareItinerary,
  RegenerateDay,
} = require("../../controllers/ItineraryController/ItineraryController");
const verifyJWE = require("../../Middleware/DecodeToken");
const optionalDecodeToken = require("../../Middleware/OptionalDecodeToken");

/**
 * @openapi
 * /api/itinerary/generate:
 *   post:
 *     tags: [Itinerary]
 *     summary: Generate a new itinerary
 *     description: Creates an AI-generated itinerary for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [destination, startDate, endDate, startTime, endTime, interests, tripType, transportMode, budget]
 *             properties:
 *               destination:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               tripType:
 *                 type: string
 *               transportMode:
 *                 type: string
 *               budget:
 *                 type: string
 *     responses:
 *       201:
 *         description: Itinerary created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing or invalid itinerary fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.post("/generate", verifyJWE, createItinerary);

/**
 * @openapi
 * /api/itinerary/get-all:
 *   get:
 *     tags: [Itinerary]
 *     summary: List user itineraries
 *     description: Returns itineraries created by the authenticated user.
 *     security:
 *       - bearerAuth: []
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
 *         description: Itineraries returned.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Itinerary'
 *                 - type: object
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
router.get("/get-all", verifyJWE, FindItinerary);

/**
 * @openapi
 * /api/itinerary/delete/{id}:
 *   post:
 *     tags: [Itinerary]
 *     summary: Delete an itinerary
 *     description: Deletes an itinerary owned by the authenticated user.
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
 *         description: Itinerary deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Unauthorized to delete itinerary.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/delete/:id", verifyJWE, DeleteItinerary);
router.delete("/delete/:id", verifyJWE, DeleteItinerary);

/**
 * @openapi
 * /api/itinerary/{id}/duplicate:
 *   post:
 *     tags: [Itinerary]
 *     summary: Duplicate an itinerary
 *     description: Creates a copy of an existing itinerary for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Itinerary duplicated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/duplicate", verifyJWE, DuplicateItinerary);

/**
 * @openapi
 * /api/itinerary/{id}/share:
 *   post:
 *     tags: [Itinerary]
 *     summary: Prepare share link
 *     description: Returns a share-ready URL for an itinerary.
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
 *         description: Share details returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/share", verifyJWE, ShareItinerary);

/**
 * @openapi
 * /api/itinerary/{id}/regenerate-day:
 *   post:
 *     tags: [Itinerary]
 *     summary: Regenerate a single itinerary day
 *     description: Regenerates the plan for a single day in an itinerary.
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
 *             properties:
 *               dayNumber:
 *                 type: integer
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Day regenerated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/regenerate-day", verifyJWE, RegenerateDay);

/**
 * @openapi
 * /api/itinerary/{id}:
 *   get:
 *     tags: [Itinerary]
 *     summary: Get an itinerary by id
 *     description: Returns a single itinerary for the authenticated user.
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
 *         description: Itinerary returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", optionalDecodeToken, GetItineraryById);

/**
 * @openapi
 * /api/itinerary/{id}:
 *   put:
 *     tags: [Itinerary]
 *     summary: Update an itinerary
 *     description: Updates itinerary fields for the authenticated user.
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
 *             properties:
 *               destination:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               tripType:
 *                 type: string
 *               transportMode:
 *                 type: string
 *               budget:
 *                 type: string
 *     responses:
 *       200:
 *         description: Itinerary updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", verifyJWE, UpdateItinerary);

module.exports = router;
