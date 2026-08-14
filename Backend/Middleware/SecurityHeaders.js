const helmet = require("helmet");

/**
 * Configure security headers using Helmet
 * Implements industry-standard security practices
 */
const securityHeaders = () => {
    return helmet({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                scriptSrc: ["'self'", "https:"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https:"],
                fontSrc: ["'self'", "https:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        // X-Frame-Options: Clickjacking protection
        frameguard: { action: "deny" },
        // X-Content-Type-Options: MIME type sniffing prevention
        noSniff: true,
        // Strict-Transport-Security: HTTPS enforcement
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        // X-XSS-Protection: Browser XSS filtering (legacy)
        xssFilter: true,
        // Referrer-Policy: Control referrer information
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        // Permissions-Policy: Disable unnecessary browser features
        permittedCrossDomainPolicies: false,
    });
};

module.exports = securityHeaders;
