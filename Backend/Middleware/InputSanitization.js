/**
 * Prevent unsafe request keys and basic XSS input issues without relying on
 * packages that are incompatible with the current Express runtime.
 */
const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;
    return input
        .replace(/[<>"']/g, "") // Remove dangerous characters
        .trim();
};

/**
 * Sanitize object fields recursively
 */
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
            const safeKey = String(key).replace(/\$/g, "_").replace(/\./g, "_");
            acc[safeKey] = sanitizeObject(obj[key]);
            return acc;
        }, {});
    }

    if (typeof obj === "string") {
        return sanitizeInput(obj);
    }

    return obj;
};

const sanitizeRequestObject = (target) => {
    if (!target || typeof target !== "object") return target;

    if (Array.isArray(target)) {
        return target.map((item) => sanitizeRequestObject(item));
    }

    return Object.keys(target).reduce((acc, key) => {
        const safeKey = String(key).replace(/\$/g, "_").replace(/\./g, "_");
        acc[safeKey] = sanitizeRequestObject(target[key]);
        return acc;
    }, {});
};

const sanitizeRequest = (req) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeRequestObject(req.body);
    }

    if (req.params && typeof req.params === "object") {
        req.params = sanitizeRequestObject(req.params);
    }

    if (req.query && typeof req.query === "object") {
        const sanitizedQuery = sanitizeRequestObject(req.query);
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
    }
};

const requestSanitizer = (req, res, next) => {
    try {
        sanitizeRequest(req);
        next();
    } catch (error) {
        next(error);
    }
};

const xssProtection = (req, res, next) => {
    try {
        sanitizeRequest(req);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestSanitizer,
    xssProtection,
    sanitizeInput,
    sanitizeObject,
};
