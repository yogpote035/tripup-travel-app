const express = require("express");

const router = express.Router();
const { getUser } = require("../../middleware/getUser");
const {
  TrainBetween,
  bookTrain,
} = require("../../controllers/TrainController/TrainController");
router.get("/train-between", TrainBetween);
router.post("/train-book-seat", getUser, bookTrain);

module.exports = router;
