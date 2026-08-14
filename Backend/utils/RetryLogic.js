/**
 * Retry logic for failed operations (especially database and external API calls)
 */

/**
 * Retry decorator for async functions
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} delayMs - Delay between retries in milliseconds
 * @param {function} shouldRetry - Function to determine if error is retryable
 */
const retryAsync = (maxAttempts = 3, delayMs = 1000, shouldRetry = null) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            let lastError;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error;

                    // Check if error is retryable
                    if (shouldRetry && !shouldRetry(error)) {
                        throw error;
                    }

                    if (attempt < maxAttempts) {
                        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
            }

            throw lastError;
        };

        return descriptor;
    };
};

/**
 * Functional retry wrapper for promises
 */
const withRetry = async (
    asyncFn,
    maxAttempts = 3,
    delayMs = 1000,
    shouldRetry = null
) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;

            if (shouldRetry && !shouldRetry(error)) {
                throw error;
            }

            if (attempt < maxAttempts) {
                const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

/**
 * Determine whether a TiDB/MySQL connection error is retryable.
 */
const isRetryableDatabaseError = (error) => {
    const retryableErrorCodes = [
        "ECONNREFUSED",
        "ECONNRESET",
        "ETIMEDOUT",
        "ER_CON_COUNT_ERROR",
    ];

    // Network errors
    if (error.code && retryableErrorCodes.includes(error.code)) return true;

    // Connection errors
    if (
        error.message &&
        (error.message.includes("ECONNREFUSED") ||
            error.message.includes("ENOTFOUND") ||
            error.message.includes("ETIMEDOUT"))
    ) {
        return true;
    }

    return false;
};

/**
 * Determine if API error is retryable
 */
const isRetryableApiError = (error) => {
    // Retry on network errors
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return true;
    }

    // Retry on 5xx errors
    if (error.status && error.status >= 500) {
        return true;
    }

    // Retry on specific status codes
    const retryableStatuses = [408, 429, 503, 504];
    return error.status && retryableStatuses.includes(error.status);
};

module.exports = {
    retryAsync,
    withRetry,
    isRetryableDatabaseError,
    isRetryableApiError,
};
