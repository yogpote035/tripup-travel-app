const express = require("express");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const connectToDatabase = require("./connectToDatabase");
const cookieParser = require("cookie-parser");

//   PRODUCTION MIDDLEWARE & CONFIG
const securityHeaders = require("./Middleware/SecurityHeaders");
const { globalLimiter, authLimiter, bookingLimiter, uploadLimiter } = require("./Middleware/RateLimiter");
const { requestSanitizer, xssProtection } = require("./Middleware/InputSanitization");
const { requestLogger, logger } = require("./Middleware/Logger");
const { globalErrorHandler, asyncHandler } = require("./Middleware/ErrorHandler");
const { validateEnvironment, getConfig } = require("./config/environment");
const swaggerSpec = require("./config/swagger");
const { healthCheckMiddleware } = require("./utils/HealthCheck");

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Validate environment on startup
validateEnvironment();
const config = getConfig();

const app = express();
const PORT = config.port;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (config.cors.origins.includes(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
};

//   SECURITY HEADERS - HELMET
app.use(securityHeaders());

//   COMPRESSION - Gzip compression for responses
app.use(compression());

//   RATE LIMITING - Global protection
app.use("/api/", globalLimiter);

//   CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    logger.info("🔍 CORS Origin Check", { origin });
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    logger.warn("❌ CORS Rejected", { origin });
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Note: Preflight (app.options) disabled due to Express 5 compatibility issues
// CORS is still functional via cors() middleware

//   BODY PARSING
app.use(express.json({
  limit: "10mb",
  verify: (req, res, buffer) => {
    req.rawBody = buffer.toString("utf8");
  },
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

//   SECURITY - INPUT SANITIZATION
app.use(requestSanitizer);
app.use(xssProtection); // XSS protection

//   LOGGING - Request logging middleware
app.use(requestLogger);

// AUDIT LOGGING MIDDLEWARE
const { auditLogMiddleware } = require("./Middleware/auditLogger");
app.use(auditLogMiddleware);

connectToDatabase().catch((error) => {
  logger.error("❌ Database connection failed after retries", { error: error.message });
});

//   SWAGGER API DOCUMENTATION
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
}));

//   HEALTH CHECK ENDPOINTS
app.get("/health", healthCheckMiddleware());
app.get("/api/health", healthCheckMiddleware());
app.head("/health", (req, res) => res.status(200).send());

//   ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TripUp Backend 🚀",
    version: "1.0.0",
    docs: "/api/docs",
    status: "running",
  });
});

//   ROUTE MOUNTING WITH SPECIFIC RATE LIMITERS

logger.info("📡 Mounting API Routes...");

try {
  // Razorpay authenticates this public route with its webhook signature.
  app.use("/api/razorpay", require("./routes/PaymentRoutes/UniversalWebhook"));

  // Authentication routes (stricter rate limiting)
  logger.info("Mounting Auth Routes...");
  app.use("/api/auth", authLimiter, require("./routes/AuthenticationRoutes"));
  logger.info("  Auth Routes mounted");

  // Train routes
  logger.info("Mounting Train Routes...");
  app.use("/api/train", require("./routes/TrainRoutes"));
  logger.info("  Train Routes mounted");

  // User routes
  logger.info("Mounting User Routes...");
  app.use("/api/user", require("./routes/UserInfoRoute"));
  logger.info("  User Routes mounted");

  // Bus routes
  logger.info("Mounting Bus Routes...");
  app.use("/api/bus", require("./routes/BusRoutes"));
  logger.info("  Bus Routes mounted");

  // Flight routes
  logger.info("Mounting Flight Routes...");
  app.use("/api/flight", require("./routes/FlightRoutes"));
  logger.info("  Flight Routes mounted");

  // Itinerary routes
  logger.info("Mounting Itinerary Routes...");
  app.use("/api/itinerary", require("./routes/Itinerary"));
  logger.info("  Itinerary Routes mounted");

  // Image routes (upload limiting)
  logger.info("Mounting Image Routes...");
  app.use("/api/images", uploadLimiter, require("./routes/Image"));
  logger.info("  Image Routes mounted");

  // Social Feed routes
  logger.info("Mounting Social Feed Routes...");
  app.use("/api/posts", require("./routes/SocialFeedRoutes"));
  logger.info("  Social Feed Routes mounted");

  // Location routes
  logger.info("Mounting Location Routes...");
  app.use("/api/locations", require("./routes/LocationRoutes"));
  logger.info("  Location Routes mounted");

  // Hotel routes
  logger.info("Mounting Hotel Routes...");
  app.use("/api/hotels", require("./routes/HotelRoutes"));
  logger.info("  Hotel Routes mounted");

  // Booking routes (moderate rate limiting)
  logger.info("Mounting Booking Routes...");
  app.use("/api/bookings", bookingLimiter, require("./routes/BookingRoutes"));
  logger.info("  Booking Routes mounted");

  // Notification routes
  logger.info("Mounting Notification Routes...");
  app.use('/api/notifications', require('./routes/Notifications'));
  logger.info("  Notification Routes mounted");

  // Admin routes (stricter rate limiting)
  logger.info("Mounting Admin Routes...");
  app.use("/api/admin", authLimiter, require("./routes/AdminRoutes"));
  logger.info("  Admin Routes mounted");
} catch (routeError) {
  logger.error("❌ Error mounting routes", { error: routeError.message, stack: routeError.stack });
  throw routeError;
}

//   404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

//   GLOBAL ERROR HANDLER (Must be last)
app.use(globalErrorHandler);

//    SERVER WITH SOCKET.IO
const http = require('http');
const server = http.createServer(app);
const { init } = require('./utils/socket');

// Initialize socket.io BEFORE starting the server
try {
  init(server);
  logger.info('✅ Socket.io initialized');
} catch (e) {
  logger.error('❌ Failed to initialize socket.io', { error: e.message });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error("❌ Port already in use", { port: PORT, message: error.message });
  } else {
    logger.error("❌ Server startup failed", { error: error.message, stack: error.stack });
  }
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`  Server listening on PORT ${PORT}`, {
    environment: config.env,
    nodeVersion: process.version,
  });
  console.log(`\n🚀 TripUp Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs\n`);

  // Schedule automated daily backups (runs at 2 AM every day)
  const schedule = require("node-schedule");
  const backupController = require("./controllers/AdminController/BackupController");

  if (!process.env.DISABLE_BACKUP_SCHEDULING) {
    schedule.scheduleJob("0 2 * * *", () => {
      logger.info("🔄 Running automated daily backup...");
      backupController.scheduleAutomatedBackup().catch((err) => {
        logger.error("❌ Automated backup failed", { error: err.message });
      });
    });
    logger.info("✅ Automated daily backup scheduled (2 AM UTC)");
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection', { reason, promise });
});
