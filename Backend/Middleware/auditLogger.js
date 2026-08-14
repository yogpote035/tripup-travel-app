const AuditLogModel = require("../models/AuditLogModel");
const UserModel = require("../models/UserModel");

/**
 * Middleware to log API activities
 */
module.exports.auditLogMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response details
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const isAdmin = req.user?.role === "admin";

        // Determine action from endpoint
        let action = "API_CALL";
        let resource = "API";
        let resourceId = null;

        const endpoint = req.path;
        const method = req.method;

        // Map endpoints to actions
        if (endpoint.includes("/auth/login")) action = "LOGIN";
        else if (endpoint.includes("/auth/logout")) action = "LOGOUT";
        else if (endpoint.includes("/auth/signup")) action = "SIGNUP";
        else if (endpoint.includes("/auth/reset-password")) action = "PASSWORD_RESET";
        else if (endpoint.includes("/user") && method === "PUT") action = "PROFILE_UPDATE";
        else if (endpoint.includes("/posts") && method === "POST") {
            action = "POST_CREATE";
            resource = "Post";
        } else if (endpoint.includes("/posts") && method === "PUT") {
            action = "POST_UPDATE";
            resource = "Post";
        } else if (endpoint.includes("/posts") && method === "DELETE") {
            action = "POST_DELETE";
            resource = "Post";
        } else if (endpoint.includes("/like")) {
            action = "POST_LIKE";
            resource = "Post";
        } else if (endpoint.includes("/bookmark")) {
            action = "POST_BOOKMARK";
            resource = "Post";
        } else if (endpoint.includes("/comment") && method === "POST") {
            action = "COMMENT_ADD";
            resource = "Comment";
        } else if (endpoint.includes("/comment") && method === "DELETE") {
            action = "COMMENT_DELETE";
            resource = "Comment";
        } else if (endpoint.includes("/booking") && method === "POST") {
            action = "BOOKING_CREATE";
            resource = "Booking";
        } else if (endpoint.includes("/booking") && method === "DELETE") {
            action = "BOOKING_CANCEL";
            resource = "Booking";
        } else if (endpoint.includes("/review")) {
            action = "LOCATION_REVIEW";
            resource = "Location";
        } else if (endpoint.includes("/admin")) {
            action = "ADMIN_USER_MANAGE";
            resource = "Admin";
        }

        // Extract resource ID from URL if available
        const idMatch = req.path.match(/\/([a-f0-9]{24})(?:\/|$)/);
        if (idMatch) resourceId = idMatch[1];

        // Log to database asynchronously (don't block response)
        if (req.user) {
            AuditLogModel.create({
                user: {
                    id: req.user.userId,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                },
                action,
                resource,
                resourceId,
                method,
                endpoint,
                status: res.statusCode < 400 ? "SUCCESS" : "FAILURE",
                statusCode: res.statusCode,
                ipAddress: req.ip,
                userAgent: req.get("user-agent"),
                duration,
                isAdmin,
                errorMessage: res.statusCode >= 400 ? data?.message : null,
                metadata: {
                    query: req.query,
                    params: req.params,
                },
            }).catch((err) => console.error("Audit log error:", err));
        }

        // Send response
        originalSend.call(this, data);
    };

    next();
};

/**
 * Manual audit log creation for specific actions
 */
module.exports.createAuditLog = async (userId, action, resource, resourceId, status = "SUCCESS", metadata = {}) => {
    try {
        const user = await UserModel.findById(userId).select("name email role").lean();

        await AuditLogModel.create({
            user: {
                id: userId,
                name: user?.name,
                email: user?.email,
                role: user?.role,
            },
            action,
            resource,
            resourceId,
            status,
            isAdmin: user?.role === "admin",
            metadata,
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
};
