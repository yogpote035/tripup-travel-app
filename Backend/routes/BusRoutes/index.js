const express = require("express");

const router = express.Router();

const verifyJWE = require("../../Middleware/DecodeToken");
const { findBus } = require("../../BusController/BusController");

router.get("/bus-between",  findBus);

module.exports = router;
