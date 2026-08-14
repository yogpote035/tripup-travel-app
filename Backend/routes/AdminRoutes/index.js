const express = require("express");
const verifyJWE = require("../../Middleware/DecodeToken");
const requireAdmin = require("../../Middleware/RequireAdmin");
const admin = require("../../controllers/AdminController/AdminController");
const flights = require("../../controllers/AdminController/FlightManagementController");
const trains = require("../../controllers/AdminController/TrainManagementController");
const buses = require("../../controllers/AdminController/BusManagementController");
const locationsAdmin = require("../../controllers/AdminController/LocationManagementController");
const hotelAdmin = require("../../controllers/AdminController/HotelManagementController");
const upload = require("../../Middleware/upload");
const router = express.Router();

router.use(verifyJWE, requireAdmin);

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard
 *     description: Returns aggregate counts and system health data for admin users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/dashboard", admin.getDashboard);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 *     description: Returns user accounts that can be managed by an administrator.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/users", admin.getUsers);

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a user status
 *     description: Enables or disables an existing user account.
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
 *             $ref: '#/components/schemas/AdminStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: User status updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
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
router.patch("/users/:id/status", admin.updateUserStatus);

/**
 * @openapi
 * /api/admin/admins:
 *   get:
 *     tags: [Admin]
 *     summary: List admins
 *     description: Returns administrator accounts available to the current admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admins returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/admins", admin.getAdmins);

/**
 * @openapi
 * /api/admin/admins:
 *   post:
 *     tags: [Admin]
 *     summary: Create an admin account
 *     description: Creates a new administrator account for the platform.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateRequest'
 *     responses:
 *       201:
 *         description: Admin created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
router.post("/admins", admin.createAdmin);

/**
 * @openapi
 * /api/admin/admins/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update an admin status
 *     description: Enables or disables an administrator account.
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
 *             $ref: '#/components/schemas/AdminStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Admin status updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Admin not found.
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
router.patch("/admins/:id/status", admin.updateAdminStatus);

/**
 * @openapi
 * /api/admin/bookings:
 *   get:
 *     tags: [Admin]
 *     summary: List all bookings
 *     description: Returns all bookings across the platform for admin review.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/bookings", admin.getBookings);

/**
 * @openapi
 * /api/admin/posts:
 *   get:
 *     tags: [Admin]
 *     summary: List posts
 *     description: Returns posts that an administrator can review or moderate.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/posts", admin.getPosts);

/**
 * @openapi
 * /api/admin/posts/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a post
 *     description: Removes a post from the platform at the request of an administrator.
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
 *       401:
 *         description: Missing or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/posts/:id", admin.deletePost);

/**
 * @openapi
 * /api/admin/flights/export:
 *   get:
 *     tags: [Admin]
 *     summary: Export flights
 *     description: Exports the current flight inventory data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flight export returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/flights/export", flights.exportFlights);

/**
 * @openapi
 * /api/admin/flights:
 *   get:
 *     tags: [Admin]
 *     summary: List flights
 *     description: Returns all flight records available for admin management.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flights returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/flights", flights.listFlights);

/**
 * @openapi
 * /api/admin/flights:
 *   post:
 *     tags: [Admin]
 *     summary: Create a flight
 *     description: Creates a new flight record in the system.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlightAdminRequest'
 *     responses:
 *       201:
 *         description: Flight created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
router.post("/flights", flights.createFlight);

/**
 * @openapi
 * /api/admin/flights/import:
 *   post:
 *     tags: [Admin]
 *     summary: Import flights
 *     description: Imports a batch of flight records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flights imported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid import payload.
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
 *       403:
 *         description: Forbidden for non-admin users.
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
router.post("/flights/import", flights.importFlights);

/**
 * @openapi
 * /api/admin/flights/bulk:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete flights in bulk
 *     description: Removes multiple flight records at once.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flights deleted successfully.
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
 *         description: Forbidden for non-admin users.
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
router.delete("/flights/bulk", flights.bulkDeleteFlights);

/**
 * @openapi
 * /api/admin/flights/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a flight by id
 *     description: Returns a specific flight record for admin review.
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
 *         description: Flight returned.
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
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/flights/:id", flights.getFlight);

/**
 * @openapi
 * /api/admin/flights/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a flight
 *     description: Updates an existing flight record.
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
 *             $ref: '#/components/schemas/FlightAdminRequest'
 *     responses:
 *       200:
 *         description: Flight updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/flights/:id", flights.updateFlight);

/**
 * @openapi
 * /api/admin/flights/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a flight
 *     description: Removes a specific flight record.
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
 *         description: Flight deleted successfully.
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
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/flights/:id", flights.deleteFlight);

// Admin - Locations
router.get("/locations", locationsAdmin.listLocations);
router.post("/locations", upload.array("images"), locationsAdmin.createLocation);
router.patch("/locations/:id", upload.array("images"), locationsAdmin.updateLocation);
router.delete("/locations/:id", locationsAdmin.deleteLocation);

// Admin - Hotels
router.get("/hotels", hotelAdmin.listHotels);
router.get("/hotels/:id/bookings", admin.getHotelBookings);
router.post("/hotels", upload.array("images"), hotelAdmin.createHotel);
router.patch("/hotels/:id", upload.array("images"), hotelAdmin.updateHotel);
router.delete("/hotels/:id", hotelAdmin.deleteHotel);

/**
 * @openapi
 * /api/admin/trains:
 *   get:
 *     tags: [Admin]
 *     summary: List trains
 *     description: Returns train inventory records for admin management.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trains returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/trains", trains.list);

/**
 * @openapi
 * /api/admin/trains:
 *   post:
 *     tags: [Admin]
 *     summary: Create a train
 *     description: Creates a new train record in the system.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainAdminRequest'
 *     responses:
 *       201:
 *         description: Train created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
router.post("/trains", trains.create);

/**
 * @openapi
 * /api/admin/trains/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a train
 *     description: Updates an existing train record.
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
 *             $ref: '#/components/schemas/TrainAdminRequest'
 *     responses:
 *       200:
 *         description: Train updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Train not found.
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
router.patch("/trains/:id", trains.update);

/**
 * @openapi
 * /api/admin/trains/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a train
 *     description: Removes a specific train record.
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
 *         description: Train deleted successfully.
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
 *         description: Forbidden for non-admin users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Train not found.
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
router.delete("/trains/:id", trains.remove);

/**
 * @openapi
 * /api/admin/buses:
 *   get:
 *     tags: [Admin]
 *     summary: List buses
 *     description: Returns bus inventory records for admin management.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buses returned.
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
 *         description: Forbidden for non-admin users.
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
router.get("/buses", buses.list);

/**
 * @openapi
 * /api/admin/buses:
 *   post:
 *     tags: [Admin]
 *     summary: Create a bus
 *     description: Creates a new bus record in the system.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusAdminRequest'
 *     responses:
 *       201:
 *         description: Bus created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
router.post("/buses", buses.create);

/**
 * @openapi
 * /api/admin/buses/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a bus
 *     description: Updates an existing bus record.
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
 *             $ref: '#/components/schemas/BusAdminRequest'
 *     responses:
 *       200:
 *         description: Bus updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *       403:
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/buses/:id", buses.update);

/**
 * @openapi
 * /api/admin/buses/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a bus
 *     description: Removes a specific bus record.
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
 *         description: Bus deleted successfully.
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
 *         description: Forbidden for non-admin users.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/buses/:id", buses.remove);

// ===================== AUDIT & MONITORING ROUTES =====================
const auditController = require("../../controllers/AdminController/AdminAuditController");
const backupController = require("../../controllers/AdminController/BackupController");

// Audit Logs
router.get("/audit-logs", auditController.getAuditLogs);
router.get("/audit-logs/user/:userId", auditController.getUserAuditLogs);
router.get("/audit-logs/admin", auditController.getAdminAuditLogs);

// System Metrics & Health
router.get("/system/metrics", auditController.getSystemMetrics);
router.get("/system/errors", auditController.getSystemErrors);
router.get("/system/stats", auditController.getActivityStats);

// Backups
router.post("/backup/create", backupController.createBackup);
router.get("/backup/list", backupController.getBackups);
router.post("/backup/restore", backupController.restoreBackup);
router.post("/backup/cleanup", backupController.deleteOldBackups);
router.get("/backup/download/:backupId", backupController.downloadBackup);
router.delete("/backup/:backupId", backupController.deleteBackup);

module.exports = router;
