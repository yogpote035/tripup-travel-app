const express = require("express");

const router = express.Router();
const {
  getFlightsBetweenAirports,
  bookFlight,
  getAllFlightBookingsForUser,
  downloadFlightTicket,
  MailFlightTicket,
  cancelFlightBooking,
} = require("../../controllers/FlightController/FlightController");

const verifyJWE = require("../../Middleware/DecodeToken");

/**
 * @openapi
 * /api/flight/flight-between:
 *   get:
 *     tags: [Flights]
 *     summary: Search flights between airports
 *     description: Searches available flights for the provided origin, destination, and date.
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
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flights returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing search parameters.
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
router.get("/flight-between", getFlightsBetweenAirports);

/**
 * @openapi
 * /api/flight/book-flight-seat:
 *   post:
 *     tags: [Flights]
 *     summary: Book a flight seat
 *     description: Reserves seats for a flight booking for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [flightId, journeyDate, from, to, passengers]
 *             properties:
 *               flightId:
 *                 type: string
 *               journeyDate:
 *                 type: string
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Flight booked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing booking details.
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
 *         description: Flight not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: One or more seats are unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/book-flight-seat", verifyJWE, bookFlight);

/**
 * @openapi
 * /api/flight/my-flights:
 *   get:
 *     tags: [Flights]
 *     summary: List user's flight bookings
 *     description: Returns all flight bookings for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flight bookings returned.
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
router.get("/my-flights", verifyJWE, getAllFlightBookingsForUser);

/**
 * @openapi
 * /api/flight/download-flight-ticket:
 *   get:
 *     tags: [Flights]
 *     summary: Download a flight ticket PDF
 *     description: Downloads a PDF ticket for a specific flight booking.
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
router.get("/download-flight-ticket", verifyJWE, downloadFlightTicket);

/**
 * @openapi
 * /api/flight/mail-flight-ticket:
 *   get:
 *     tags: [Flights]
 *     summary: Email a flight ticket PDF
 *     description: Emails a PDF ticket for a specific flight booking.
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
 *         description: Ticket mailed successfully.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/mail-flight-ticket", verifyJWE, MailFlightTicket);

/**
 * @openapi
 * /api/flight/cancel-flight-ticket:
 *   put:
 *     tags: [Flights]
 *     summary: Cancel a flight booking
 *     description: Cancels a flight booking and releases its seats.
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
 *         description: Flight booking cancelled successfully.
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
 *         description: Booking or flight not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/cancel-flight-ticket", verifyJWE, cancelFlightBooking);

module.exports = router;
