const express = require("express");

const router = express.Router();
const {
  TrainBetween,
  bookTrain,
  confirmTrainBooking,
  getUserBookings,
  generateReceiptPdf,
  mailTrainTicket,
  cancelTrainTicket,
} = require("../../controllers/TrainController/TrainController");

const verifyJWE = require("../../Middleware/DecodeToken");

/**
 * @openapi
 * /api/train/train-between:
 *   get:
 *     tags: [Trains]
 *     summary: Search trains between stations
 *     description: Finds trains that pass between the provided origin and destination stations.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *       - in: query
 *         name: trainType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trains returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       400:
 *         description: Missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/train-between", TrainBetween);

/**
 * @openapi
 * /api/train/train-book-seat:
 *   post:
 *     tags: [Trains]
 *     summary: Book a train seat
 *     description: Books train seats for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trainNumber, coachType, passengerNames, from, to, journeyDate, userId]
 *             properties:
 *               trainNumber:
 *                 type: string
 *               coachType:
 *                 type: string
 *               passengerNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               journeyDate:
 *                 type: string
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing or invalid booking data.
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
 *       404:
 *         description: Train or coach not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No confirmed or waiting-list capacity available.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/train-book-seat", verifyJWE, bookTrain);
router.post("/train-book-seat/confirm", verifyJWE, confirmTrainBooking);

/**
 * @openapi
 * /api/train/train-bookings:
 *   get:
 *     tags: [Trains]
 *     summary: List user train bookings
 *     description: Returns train bookings for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Train bookings returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/train-bookings", verifyJWE, getUserBookings);

/**
 * @openapi
 * /api/train/train-bookings-receipt:
 *   get:
 *     tags: [Trains]
 *     summary: Download train receipt PDF
 *     description: Downloads a PDF receipt for a train booking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF receipt returned.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Booking ID missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/train-bookings-receipt", verifyJWE, generateReceiptPdf);

/**
 * @openapi
 * /api/train/train-bookings-receipt-mail:
 *   get:
 *     tags: [Trains]
 *     summary: Email train receipt PDF
 *     description: Emails a PDF receipt for a train booking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt emailed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Booking ID missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/train-bookings-receipt-mail", verifyJWE, mailTrainTicket);

/**
 * @openapi
 * /api/train/cancel-train-ticket:
 *   put:
 *     tags: [Trains]
 *     summary: Cancel a train booking
 *     description: Cancels a train booking and releases its seats.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId]
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Train booking cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Booking ID missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking or train not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/cancel-train-ticket", verifyJWE, cancelTrainTicket);

module.exports = router;
