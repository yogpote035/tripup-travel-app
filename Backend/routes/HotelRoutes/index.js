const express = require("express");
const verifyJWE = require("../../Middleware/DecodeToken");
const {
    searchHotels,
    getHotelDetails,
    bookHotel,
    confirmHotelBooking,
    submitHotelReview,
    getMyHotelBookings,
} = require("../../controllers/HotelController/HotelController");

const router = express.Router();

router.get("/", searchHotels);
router.get("/:id", getHotelDetails);
router.post("/book", verifyJWE, bookHotel);
router.post("/book/:id/confirm", verifyJWE, confirmHotelBooking);
router.post("/:id/review", verifyJWE, submitHotelReview);
router.get("/bookings", verifyJWE, getMyHotelBookings);

module.exports = router;
