const { logger } = require("../Middleware/Logger");

/**
 * Required environment variables
 */
const requiredEnvVars = [
    "PORT",
    "NODE_ENV",
    "CLOUDINARY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
];

/**
 * Validate all required environment variables at startup
 */
const validateEnvironment = () => {
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}`;
        logger.error(errorMessage);
        console.error("", errorMessage);
        process.exit(1);
    }

    logger.info("Environment variables validated successfully");

    // Log current environment
    logger.info("Running in environment", {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
    });
};

/**
 * Get environment-specific configuration
 */
const getConfig = () => ({
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    database: {
        host: process.env.TIDB_HOST || process.env.DB_HOST || "localhost",
        port: Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000),
        name: process.env.TIDB_DATABASE || process.env.DB_NAME || "tripup",
        user: process.env.TIDB_USER || process.env.DB_USER || "root",
    },
    cloudinary: {
        name: process.env.CLOUDINARY_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    jwtSecrets: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "access-secret",
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
    },
    cors: {
        origins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://tripup-travel-app-eight.vercel.app").split(
            ","
        ).map((origin) => origin.trim()).filter(Boolean),
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
});

module.exports = {
    validateEnvironment,
    getConfig,
    requiredEnvVars,
};
