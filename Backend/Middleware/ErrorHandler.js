const { logger } = require("./Logger");

class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error("Unhandled API error", {
        requestId: req.requestId,
        statusCode,
        code: err.code,
        errno: err.errno,
        message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    if (err.name === "ValidationError") {
        const validationMessage = Object.values(err.errors || {})
            .map((value) => value.message)
            .join(", ");
        return res.status(400).json({ success: false, message: "Validation Error", errors: validationMessage });
    }

    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
        return res.status(409).json({ success: false, message: "A record with that value already exists" });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired" });
    }

    if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, globalErrorHandler, asyncHandler };
