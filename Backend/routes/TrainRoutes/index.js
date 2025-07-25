const express = require("express");

const router = express.Router();
const { getUser } = require("../../middleware/getUser");
const {
  TrainBetween,
} = require("../../controllers/TrainController/TrainController");
router.get("/train-between", TrainBetween);

module.exports = router;
