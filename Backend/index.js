const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./connectToDatabase");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.get("/health", (req, res) => res.status(200).send("ok"));
app.head("/health", (req, res) => res.status(200).send("ok"));

app.get("/", (req, res) => {
  res.json("Welcome to TripUp Backend Development! 🚀");
});

app.use("/api/auth", require("./routes/AuthenticationRoutes"));
app.use("/api/train", require("./routes/TrainRoutes"));
app.use("/api/user", require("./routes/UserInfoRoute"));
app.use("/api/bus", require("./routes/BusRoutes"));
app.use("/api/flight", require("./routes/FlightRoutes"));

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT} ⛳`);
});
