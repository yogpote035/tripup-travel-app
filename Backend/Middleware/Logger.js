const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
        new DailyRotateFile({ filename: path.join(logsDir, "error-%DATE%.log"), datePattern: "YYYY-MM-DD", maxSize: "20m", maxDays: "14d", level: "error" }),
        new DailyRotateFile({ filename: path.join(logsDir, "combined-%DATE%.log"), datePattern: "YYYY-MM-DD", maxSize: "20m", maxDays: "14d" }),
    ],
});

// API runtime failures must always reach the server terminal. Set this to
// false only when a process manager is already collecting Winston output.
if (process.env.LOG_TO_CONSOLE !== "false") {
    logger.add(new winston.transports.Console({ format: logFormat }));
}

const responseSummary = (payload) => {
    if (!payload) return undefined;
    try {
        const body = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (!body || typeof body !== "object") return undefined;
        return {
            message: body.message,
            code: body.code,
            errors: Array.isArray(body.errors)
                ? body.errors.slice(0, 5).map((error) => ({ field: error.field, message: error.message }))
                : undefined,
        };
    } catch {
        return undefined;
    }
};

/**
 * Log every API response. This captures failures returned directly from
 * controller catch blocks as well as errors handled by Express middleware.
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.get("x-request-id") || randomUUID();
    let responseBody;

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    const originalSend = res.send;
    res.send = function send(data) {
        responseBody = data;
        return originalSend.call(this, data);
    };

    res.on("finish", () => {
        const details = {
            requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${Date.now() - startTime}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };

        if (res.statusCode >= 400) {
            logger.error("API request failed", { ...details, response: responseSummary(responseBody) });
        } else {
            logger.info("API request completed", details);
        }
    });

    next();
};

module.exports = { logger, requestLogger };
