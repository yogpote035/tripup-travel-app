const router = require("express").Router();
const verifyJWE = require("../../Middleware/DecodeToken");
const booking = require("../../controllers/BookingController/BookingLifecycleController");
router.use(verifyJWE);

/**
 * @openapi
 * /api/bookings/pending:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a pending booking
 *     description: Creates a booking hold for a flight, train, or bus service before payment confirmation.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingType, resource, passengers, amount]
 *             properties:
 *               bookingType:
 *                 type: string
 *               resource:
 *                 type: string
 *               route:
 *                 type: object
 *               passengers:
 *                 type: array
 *               seatNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid booking payload.
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
 *       409:
 *         description: One or more seats are already reserved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/pending", booking.createPending);

/**
 * @openapi
 * /api/bookings/{id}/payment-success:
 *   post:
 *     tags: [Bookings]
 *     summary: Confirm a pending booking
 *     description: Confirms a pending booking and marks seats as booked.
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
 *         description: Booking confirmed.
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
 *         description: Pending booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       410:
 *         description: Booking hold expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Seats are no longer available.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/payment-success", booking.confirmPayment);

/**
 * @openapi
 * /api/bookings/history:
 *   get:
 *     tags: [Bookings]
 *     summary: List booking history
 *     description: Returns the authenticated user's booking history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking history returned.
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
 */
router.get("/history", booking.history);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     description: Cancels a pending or confirmed booking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Booking cannot be cancelled.
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
 */
router.post("/:id/cancel", booking.cancel);

/**
 * @openapi
 * /api/bookings/{id}/invoice:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking invoice
 *     description: Returns a simplified invoice payload for a booking.
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
 *         description: Invoice returned.
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
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id/invoice", booking.invoice);
module.exports = router;
