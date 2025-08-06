const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./connectToDatabase");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://tripup-travel-app-eight.vercel.app",
  "https://tripup-travel-app-smartyatris-projects.vercel.app",
  "https://tripup-travel-app-git-main-smartyatris-projects.vercel.app",
  "https://tripup-travel-jx596oczk-smartyatris-projects.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 CORS Origin Check:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ CORS Rejected:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // ✅ Enable preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.get("/health", (req, res) => res.status(200).send("ok"));
app.head("/health", (req, res) => res.status(200).send("ok"));

app.get("/", (req, res) => {
  res.json("Welcome to TripUp Backend Development! 🚀");
});

console.log("Mounting Auth Routes...");
app.use("/api/auth", require("./routes/AuthenticationRoutes"));

console.log("Mounting Train Routes...");
app.use("/api/train", require("./routes/TrainRoutes"));

console.log("Mounting User Routes...");
app.use("/api/user", require("./routes/UserInfoRoute"));

console.log("Mounting Bus Routes...");
app.use("/api/bus", require("./routes/BusRoutes"));

console.log("Mounting Flight Routes...");
app.use("/api/flight", require("./routes/FlightRoutes"));

// ✅ Server Listening
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT} ⛳`);
});
