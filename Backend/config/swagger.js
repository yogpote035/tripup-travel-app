const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

/**
 * Swagger API Documentation configuration
 */
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TripUp Travel API",
            version: "1.0.0",
            description:
                "RESTful API for TripUp - A comprehensive travel booking application for flights, trains, buses, itineraries, social posts, and admin operations.",
            contact: {
                name: "TripUp Support",
                email: "support@tripup.com",
            },
            license: {
                name: "ISC",
            },
        },
        servers: [
            {
                url: process.env.API_URL || "http://localhost:5000",
                description: process.env.NODE_ENV === "production" ? "Production Server" : "Development Server",
            },
        ],
        tags: [
            { name: "Authentication", description: "Registration, login, session, and token endpoints" },
            { name: "Users", description: "User profile and recent activity endpoints" },
            { name: "Social Feed", description: "Posts, comments, likes, bookmarks, and location ratings" },
            { name: "Itinerary", description: "Trip planning and AI-generated itinerary management" },
            { name: "Flights", description: "Flight search, booking, ticketing, and cancellation" },
            { name: "Trains", description: "Train search, booking, ticketing, and cancellation" },
            { name: "Buses", description: "Bus search, booking, ticketing, and cancellation" },
            { name: "Bookings", description: "Booking lifecycle and invoice operations" },
            { name: "Admin", description: "Administrative dashboard and management endpoints" },
            { name: "Notifications", description: "Notification retrieval and management" },
            { name: "Images", description: "Image optimization and media processing endpoints" },
            { name: "Health", description: "Server health and availability checks" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Request failed" },
                        errors: {
                            type: "array",
                            items: { type: "object" },
                        },
                    },
                },
                ValidationErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Validation failed" },
                        errors: {
                            type: "array",
                            items: { type: "object" },
                        },
                    },
                },
                AdminCreateRequest: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name: { type: "string", example: "Ava Admin" },
                        email: { type: "string", format: "email", example: "ava@tripup.com" },
                        password: { type: "string", format: "password", example: "StrongPass123!" },
                        role: { type: "string", enum: ["admin"], example: "admin" },
                    },
                },
                AdminStatusUpdateRequest: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: { type: "string", enum: ["active", "inactive", "suspended"], example: "active" },
                    },
                },
                ImageOptimizeRequest: {
                    type: "object",
                    properties: {
                        imageUrl: { type: "string", format: "uri", example: "https://example.com/image.jpg" },
                        quality: { type: "integer", minimum: 1, maximum: 100, example: 80 },
                    },
                },
                ImageOptimizeResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Image optimized successfully" },
                        data: {
                            type: "object",
                            properties: {
                                url: { type: "string", format: "uri", example: "https://example.com/optimized.jpg" },
                                size: { type: "integer", example: 102400 },
                            },
                        },
                    },
                },
                FlightAdminRequest: {
                    type: "object",
                    properties: {
                        airline: { type: "string", example: "IndiGo" },
                        flightNumber: { type: "string", example: "6E 101" },
                        origin: { type: "string", example: "DEL" },
                        destination: { type: "string", example: "BOM" },
                        departureTime: { type: "string", example: "2026-08-01T08:00:00.000Z" },
                        arrivalTime: { type: "string", example: "2026-08-01T10:30:00.000Z" },
                        price: { type: "number", example: 4500 },
                    },
                },
                TrainAdminRequest: {
                    type: "object",
                    properties: {
                        trainName: { type: "string", example: "Rajdhani Express" },
                        trainNumber: { type: "string", example: "12345" },
                        source: { type: "string", example: "Delhi" },
                        destination: { type: "string", example: "Mumbai" },
                        price: { type: "number", example: 3200 },
                    },
                },
                BusAdminRequest: {
                    type: "object",
                    properties: {
                        operator: { type: "string", example: "Volvo Travels" },
                        busNumber: { type: "string", example: "MH01AB1234" },
                        source: { type: "string", example: "Pune" },
                        destination: { type: "string", example: "Mumbai" },
                        price: { type: "number", example: 900 },
                    },
                },
                SignupRequest: {
                    type: "object",
                    required: ["name", "email", "phone", "password"],
                    properties: {
                        name: { type: "string", example: "Aarav Sharma" },
                        email: { type: "string", format: "email", example: "aarav@example.com" },
                        phone: { type: "string", example: "+919876543210" },
                        password: { type: "string", format: "password", example: "StrongPass123!" },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["password"],
                    properties: {
                        email: { type: "string", format: "email", example: "aarav@example.com" },
                        phone: { type: "string", example: "+919876543210" },
                        password: { type: "string", format: "password", example: "StrongPass123!" },
                    },
                },
                AuthSuccessResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "User logged in" },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    type: "object",
                                    properties: {
                                        _id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" },
                                        role: { type: "string", example: "user" },
                                    },
                                },
                                accessToken: { type: "string" },
                            },
                        },
                    },
                },
                UserProfileResponse: {
                    type: "object",
                    properties: {
                        user: { $ref: "#/components/schemas/User" },
                        totalTrainBookings: { type: "integer" },
                        totalBusBookings: { type: "integer" },
                        totalFlightBookings: { type: "integer" },
                        totalPosts: { type: "integer" },
                        totalPlans: { type: "integer" },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        role: { type: "string", enum: ["user", "admin"] },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Post: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        location: { type: "string" },
                        travelDate: { type: "string", format: "date-time" },
                        visibility: { type: "string", enum: ["public", "followers", "private"] },
                        tags: { type: "array", items: { type: "string" } },
                        images: { type: "array", items: { type: "string" } },
                        author: { type: "object" },
                        likes: { type: "array", items: { type: "string" } },
                        bookmarks: { type: "array", items: { type: "string" } },
                        comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Comment: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        text: { type: "string" },
                        user: { type: "object" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Itinerary: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        destination: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        interests: { type: "array", items: { type: "string" } },
                        tripType: { type: "string" },
                        transportMode: { type: "string" },
                        budget: { type: "string" },
                        plan: { type: "array", items: { type: "object" } },
                        user: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Booking: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        user: { type: "string" },
                        bookingType: { type: "string", enum: ["flight", "train", "bus"] },
                        status: { type: "string", enum: ["pending", "confirmed", "cancelled", "expired"] },
                        amount: { type: "number" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Notification: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        user: { type: "string" },
                        type: { type: "string" },
                        title: { type: "string" },
                        message: { type: "string" },
                        read: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                HealthResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "healthy" },
                        timestamp: { type: "string", format: "date-time" },
                        uptime: { type: "number" },
                        environment: { type: "string" },
                        dependencies: { type: "object" },
                        version: { type: "string" },
                    },
                },
            },
        },
        security: [
            { bearerAuth: [] },
            { cookieAuth: [] },
        ],
    },
    apis: [path.resolve(__dirname, "../routes/**/*.js").replace(/\\/g, "/")],
};

let swaggerSpec;
try {
    swaggerSpec = swaggerJsdoc(swaggerOptions);
} catch (error) {
    console.warn("⚠️  Swagger JSDoc parsing error:", error.message);
    swaggerSpec = swaggerJsdoc({
        definition: swaggerOptions.definition,
        apis: [],
    });
}

module.exports = swaggerSpec;
