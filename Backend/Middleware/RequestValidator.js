const { body, param, query, validationResult } = require("express-validator");

/**
 * Handle validation errors and return standardized response
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.param,
                message: err.msg,
            })),
        });
    }
    next();
};

/**
 * Common validation rules for user input
 */
const validationRules = {
    // Authentication validations
    email: body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email address"),

    password: body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            "Password must contain uppercase, lowercase, number, and special character"
        ),

    phone: body("phone")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid Indian phone number"),

    // Booking validations
    bookingId: param("id")
        .isUUID()
        .withMessage("Invalid booking ID"),

    journeyDate: body("journeyDate")
        .isISO8601()
        .withMessage("Invalid date format")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("Journey date must be in the future");
            }
            return true;
        }),

    seatNumbers: body("seatNumbers")
        .isArray({ min: 1 })
        .withMessage("At least one seat must be selected"),

    fare: body("fare")
        .isFloat({ min: 0 })
        .withMessage("Fare must be a positive number"),

    // Generic validations
    resourceId: param("id")
        .isUUID()
        .withMessage("Invalid resource ID"),

    string: (fieldName) =>
        body(fieldName)
            .trim()
            .notEmpty()
            .withMessage(`${fieldName} is required`),

    positiveNumber: (fieldName) =>
        body(fieldName)
            .isFloat({ min: 0 })
            .withMessage(`${fieldName} must be a positive number`),

    nonEmptyArray: (fieldName) =>
        body(fieldName)
            .isArray({ min: 1 })
            .withMessage(`${fieldName} must contain at least one item`),
};

/**
 * Validation chains for common operations
 */
const validationChains = {
    loginValidation: [
        validationRules.email,
        validationRules.password,
        handleValidationErrors,
    ],

    signupValidation: [
        validationRules.email,
        validationRules.password,
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is required"),
        body("phone")
            .optional()
            .matches(/^[6-9]\d{9}$/)
            .withMessage("Invalid phone number"),
        handleValidationErrors,
    ],

    bookingValidation: [
        body("journeyDate")
            .isISO8601()
            .withMessage("Invalid date format"),
        body("seatNumbers")
            .isArray({ min: 1 })
            .withMessage("At least one seat must be selected"),
        body("passengerNames")
            .isArray({ min: 1 })
            .withMessage("Passenger names required"),
        handleValidationErrors,
    ],

    updateUserValidation: [
        body("email")
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage("Invalid email"),
        body("phone")
            .optional()
            .matches(/^[6-9]\d{9}$/)
            .withMessage("Invalid phone number"),
        handleValidationErrors,
    ],

    idValidation: [
        param("id")
            .isUUID()
            .withMessage("Invalid ID format"),
        handleValidationErrors,
    ],
};

module.exports = {
    handleValidationErrors,
    validationRules,
    validationChains,
};
