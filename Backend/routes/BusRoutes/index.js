const express = require("express");

const router = express.Router();

const verifyJWE = require("../../Middleware/DecodeToken");
const { findBus, bookBusSeats } = require("../../BusController/BusController");

router.get("/bus-between", findBus);
router.post("/book-bus-seat", verifyJWE, bookBusSeats);

module.exports = router;
