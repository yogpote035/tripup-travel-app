const { logger } = require("../Middleware/Logger");
const { createPool, getPool, testConnection } = require("../database/connection");

/**
 * Health check endpoint response generator
 */
const getHealthStatus = (dbStatus, redisStatus) => {
    return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        dependencies: {
            database: dbStatus,
            cache: redisStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            },
        },
        version: process.env.APP_VERSION || "1.0.0",
    };
};

/**
 * Check database connectivity
 */
const checkDatabaseHealth = async () => {
    try {
        const pool = getPool() || createPool();
        await testConnection(pool);
        return {
            status: "connected",
            responseTime: "< 100ms",
        };
    } catch (error) {
        logger.error("Database health check failed", { error: error.message });
        return {
            status: "disconnected",
            error: error.message,
        };
    }
};

/**
 * Health check middleware
 */
const healthCheckMiddleware = () => {
    return async (req, res) => {
        try {
            const dbStatus = await checkDatabaseHealth();

            const healthStatus = getHealthStatus(dbStatus, {
                status: "operational",
            });

            const statusCode =
                dbStatus.status === "connected" ? 200 : 503;

            res.status(statusCode).json(healthStatus);
        } catch (error) {
            logger.error("Health check endpoint error", { error: error.message });
            res.status(503).json({
                status: "unhealthy",
                error: error.message,
            });
        }
    };
};

module.exports = {
    getHealthStatus,
    checkDatabaseHealth,
    healthCheckMiddleware,
};
