const express = require("express");

const router = express.Router();

const verifyJWE = require("../../Middleware/DecodeToken");
const {
  findBus,
  bookBusSeats,
  getMyBusBookings,
  downloadTicket,
  mailTicket,
} = require("../../BusController/BusController");

router.get("/bus-between", findBus);
router.post("/book-bus-seat", verifyJWE, bookBusSeats);
router.get("/bus-bookings", verifyJWE, getMyBusBookings);
router.get("/download-bus-ticket", verifyJWE, downloadTicket);
router.get("/mail-bus-ticket", verifyJWE, mailTicket);

module.exports = router;
