const express = require("express");

const router = express.Router();
const { getUser } = require("../../middleware/getUser");
const {
  TrainBetween,
  bookTrain,
  getUserBookings,
} = require("../../controllers/TrainController/TrainController");
router.get("/train-between", TrainBetween);
router.post("/train-book-seat", getUser, bookTrain);
router.get("/train-bookings", getUser, getUserBookings);

module.exports = router;
