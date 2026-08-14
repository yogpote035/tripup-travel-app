const rateLimit = require("express-rate-limit");

/**
 * Global rate limiter - for general API endpoints
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => process.env.NODE_ENV === "development", // Skip in development
});

/**
 * Auth rate limiter - stricter for login/signup attempts
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * Booking rate limiter - moderate for booking endpoints
 * 20 requests per 15 minutes per IP
 */
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: "Too many booking requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * Image upload rate limiter - restrictive
 * 10 requests per 15 minutes per IP
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many uploads, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development",
});

module.exports = {
    globalLimiter,
    authLimiter,
    bookingLimiter,
    uploadLimiter,
};
