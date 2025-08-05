const express = require("express");

const router = express.Router();
const {
  getFlightsBetweenAirports,
  bookFlight,
  getAllFlightBookingsForUser,
  downloadFlightTicket,
  MailFlightTicket,
} = require("../../controllers/FlightController/FlightController");

const verifyJWE = require("../../Middleware/DecodeToken");

router.get("/flight-between", getFlightsBetweenAirports);
router.post("/book-flight-seat", verifyJWE, bookFlight);
router.get("/my-flights", verifyJWE, getAllFlightBookingsForUser);
router.get("/download-flight-ticket", verifyJWE, downloadFlightTicket);
router.get("/mail-flight-ticket", verifyJWE, MailFlightTicket);

module.exports = router;
