const express = require("express");

const router = express.Router();

const verifyJWE = require("../../Middleware/DecodeToken");
const {
  findBus,
  bookBusSeats,
  confirmBusBooking,
  getMyBusBookings,
  downloadTicket,
  mailTicket,
  cancelBusBooking,
} = require("../../controllers/BusController/BusController");

/**
 * @openapi
 * /api/bus/bus-between:
 *   get:
 *     tags: [Buses]
 *     summary: Search buses between stations
 *     description: Finds buses serving the provided origin and destination for a given date.
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buses returned.
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
router.get("/bus-between", findBus);

/**
 * @openapi
 * /api/bus/book-bus-seat:
 *   post:
 *     tags: [Buses]
 *     summary: Book a bus seat
 *     description: Books one or more bus seats for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [busNumber, journeyDate, source, destination, passengers]
 *             properties:
 *               busNumber:
 *                 type: string
 *               journeyDate:
 *                 type: string
 *               source:
 *                 type: string
 *               destination:
 *                 type: string
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing booking fields.
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
 *         description: Bus not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: One or more requested seats are unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/book-bus-seat", verifyJWE, bookBusSeats);
router.post("/confirmBusBooking", verifyJWE, confirmBusBooking);

/**
 * @openapi
 * /api/bus/bus-bookings:
 *   get:
 *     tags: [Buses]
 *     summary: List user bus bookings
 *     description: Returns bus bookings for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bus bookings returned.
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
router.get("/bus-bookings", verifyJWE, getMyBusBookings);

/**
 * @openapi
 * /api/bus/download-bus-ticket:
 *   get:
 *     tags: [Buses]
 *     summary: Download a bus ticket PDF
 *     description: Downloads a PDF ticket for a bus booking.
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
 *         description: PDF ticket returned.
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
router.get("/download-bus-ticket", verifyJWE, downloadTicket);

/**
 * @openapi
 * /api/bus/mail-bus-ticket:
 *   get:
 *     tags: [Buses]
 *     summary: Email a bus ticket PDF
 *     description: Emails a PDF ticket for a bus booking.
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
 *         description: Ticket emailed successfully.
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
router.get("/mail-bus-ticket", verifyJWE, mailTicket);

/**
 * @openapi
 * /api/bus/cancel-bus-ticket:
 *   put:
 *     tags: [Buses]
 *     summary: Cancel a bus booking
 *     description: Cancels a bus booking and releases its seats.
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
 *         description: Booking cancelled successfully.
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
 *         description: Booking or bus not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/cancel-bus-ticket", verifyJWE, cancelBusBooking);

module.exports = router;
