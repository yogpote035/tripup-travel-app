const express = require("express");

const router = express.Router();
const {
  TrainBetween,
  bookTrain,
  getUserBookings,
  generateReceiptPdf,
  mailTrainTicket,
  cancelTrainTicket,
} = require("../../controllers/TrainController/TrainController");

const verifyJWE = require("../../Middleware/DecodeToken");
router.get("/train-between", TrainBetween);
router.post("/train-book-seat", verifyJWE, bookTrain);
router.get("/train-bookings", verifyJWE, getUserBookings);
router.get("/train-bookings-receipt", verifyJWE, generateReceiptPdf);
router.get("/train-bookings-receipt-mail", verifyJWE, mailTrainTicket);
router.put("/cancel-train-ticket", verifyJWE, cancelTrainTicket);

module.exports = router;
