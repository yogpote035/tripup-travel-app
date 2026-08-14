const router = require('express').Router();
const verifyJWE = require('../../Middleware/DecodeToken');
const requireAdmin = require('../../Middleware/RequireAdmin');
const ctrl = require('../../controllers/Notifications/NotificationController');
router.use(verifyJWE);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     description: Returns notifications for the authenticated user.
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
 *         description: Notifications returned.
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
router.get('/', ctrl.getNotifications);

/**
 * @openapi
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     description: Returns the count of unread notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count returned.
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
router.get('/unread-count', ctrl.unreadCount);

/**
 * @openapi
 * /api/notifications/mark-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     description: Marks one notification as read for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Notification id missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/mark-read', ctrl.markRead);

/**
 * @openapi
 * /api/notifications/mark-all-read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications updated.
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
router.post('/mark-all-read', ctrl.markAllRead);

/**
 * @openapi
 * /api/notifications/clear-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Clear all notifications
 *     description: Deletes every notification for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications cleared.
 */
router.post('/clear-all', ctrl.clearAll);

/**
 * @openapi
 * /api/notifications/announce:
 *   post:
 *     tags: [Notifications]
 *     summary: Send an announcement notification
 *     description: Sends an admin announcement notification to one or more users.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               meta:
 *                 type: object
 *     responses:
 *       200:
 *         description: Announcement sent.
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
router.post('/announce', requireAdmin, ctrl.announce);
// Admin announcement history endpoints
router.get('/admin/announcements', requireAdmin, ctrl.listAnnouncements);
router.delete('/admin/announcements/:id', requireAdmin, ctrl.deleteAnnouncement);
module.exports = router;
