const express = require("express");

const router = express.Router();
const {
  getFlightsBetweenAirports,
  bookFlight,
  getAllFlightBookingsForUser,
} = require("../../controllers/FlightController/FlightController");

const verifyJWE = require("../../Middleware/DecodeToken");

router.get("/flight-between", getFlightsBetweenAirports);
router.post("/book-flight-seat", verifyJWE, bookFlight);
router.get("/my-flights", verifyJWE, getAllFlightBookingsForUser);

module.exports = router;
