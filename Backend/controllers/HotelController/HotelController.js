const HotelModel = require("../../models/HotelModel");
const HotelBookingModel = require("../../models/HotelBookingModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { getConfig } = require("../../config/environment");
const { confirmExistingBooking } = require("../../services/payment/UniversalConfirmationService");

const config = getConfig();
const razorpayClient = config.razorpay?.keyId && config.razorpay?.keySecret
    ? new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
    })
    : null;

function verifyRazorpaySignature({ order_id, payment_id, signature }) {
    if (!config.razorpay?.keySecret || !order_id || !payment_id || !signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(`${order_id}|${payment_id}`)
        .digest("hex");
    return expectedSignature === signature;
}

exports.searchHotels = async (req, res) => {
    try {
        const { city = "", name = "" } = req.query;
        const filter = { isActive: true };

        if (city.trim()) {
            filter.city = { $regex: new RegExp(city.trim(), "i") };
        }
        if (name.trim()) {
            filter.name = { $regex: new RegExp(name.trim(), "i") };
        }

        const hotels = await HotelModel.find(filter)
            .sort({ pricePerNight: 1, starRating: -1 })
            .limit(50)
            .lean();

        res.json({ data: hotels });
    } catch (error) {
        console.error("Error searching hotels:", error);
        res.status(500).json({ message: "Error searching hotels" });
    }
};

exports.getHotelDetails = async (req, res) => {
    try {
        const hotel = await HotelModel.findById(req.params.id).lean();
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.json({ data: hotel });
    } catch (error) {
        console.error("Error fetching hotel details:", error);
        res.status(500).json({ message: "Error fetching hotel details" });
    }
};

exports.bookHotel = async (req, res) => {
    try {
        const { hotelId, checkIn, checkOut, rooms, guests, roomType, paymentMethod } = req.body;

        if (!hotelId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Hotel ID, check-in, and check-out are required" });
        }

        const hotel = await HotelModel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Check-out must be after check-in" });
        }

        const nights = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
        const roomCount = Math.max(1, Number(rooms) || 1);
        const selectedRoomType = hotel.roomTypes?.find((room) => room.type === roomType) || hotel.roomTypes?.[0];
        const unitPrice = selectedRoomType?.pricePerNight ?? hotel.pricePerNight;
        const totalFare = nights * roomCount * unitPrice;

        const newBooking = await HotelBookingModel.create({
            user: req.user.userId,
            hotel: hotel._id,
            hotelName: hotel.name,
            roomType: selectedRoomType?.type || roomType || "Standard",
            checkIn: checkInDate,
            checkOut: checkOutDate,
            rooms: roomCount,
            guests: Math.max(1, Number(guests) || 1),
            totalFare,
            status: "pending",
            bookingDate: new Date(),
            payment: {
                method: paymentMethod || "other",
                provider: "razorpay",
                status: "pending",
            },
        });

        const order = await razorpayClient.orders.create({
            amount: Math.round(totalFare * 100),
            currency: "INR",
            receipt: `hotel_booking_${newBooking._id}`,
            payment_capture: 1,
            notes: {
                hotelId: hotel._id.toString(),
                bookingId: newBooking._id.toString(),
                bookingType: "hotel",
            },
        });
        newBooking.payment = { ...(newBooking.payment || {}), orderId: order.id };
        await newBooking.save();

        res.status(201).json({
            data: {
                booking: newBooking,
                paymentOrder: order,
                paymentKeyId: config.razorpay.keyId,
            },
        });
    } catch (error) {
        console.error("Error booking hotel:", error);
        res.status(500).json({ message: "Error booking hotel" });
    }
};

exports.confirmHotelBooking = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: "Payment verification fields are required" });
        }

        const booking = await HotelBookingModel.findById(req.params.id);
        if (!booking || booking.user.toString() !== req.user.userId || booking.status !== "pending") {
            return res.status(404).json({ message: "Pending hotel booking not found" });
        }

        const expectedSignature = verifyRazorpaySignature({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        });
        if (!expectedSignature) {
            booking.payment = {
                ...booking.payment,
                status: "failed",
                reference: razorpay_payment_id,
            };
            await booking.save();
            return res.status(400).json({ message: "Payment verification failed" });
        }

        const confirmedBooking = await confirmExistingBooking({
            bookingId: booking._id,
            bookingType: "hotel",
            payment: { id: razorpay_payment_id },
            orderId: razorpay_order_id,
        });
        return res.json({ data: confirmedBooking });

        const hotel = await HotelModel.findById(booking.hotel);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        if (hotel.availableRooms < booking.rooms) {
            return res.status(409).json({ message: "Not enough rooms available" });
        }

        const roomType = hotel.roomTypes?.find((room) => room.type === booking.roomType);
        if (roomType && roomType.availableRooms < booking.rooms) {
            return res.status(409).json({ message: "Selected room type has insufficient availability" });
        }

        hotel.availableRooms -= booking.rooms;
        if (hotel.availableRooms < 0) hotel.availableRooms = 0;
        if (roomType) {
            roomType.availableRooms = Math.max(0, roomType.availableRooms - booking.rooms);
        }
        await hotel.save();

        booking.status = "confirmed";
        booking.payment = {
            method: booking.payment.method,
            provider: "razorpay",
            status: "success",
            reference: razorpay_payment_id,
        };
        await booking.save();

        res.json({ data: booking });
    } catch (error) {
        console.error("Error confirming hotel booking:", error);
        res.status(500).json({ message: "Error confirming hotel booking" });
    }
};

exports.submitHotelReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const hotel = await HotelModel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        const numericRating = Number(rating);
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
        }

        hotel.reviews.push({
            user: req.user.userId,
            name: req.user.name || "Guest",
            rating: numericRating,
            comment: String(comment || "").trim(),
        });
        hotel.reviewCount = hotel.reviews.length;
        hotel.averageRating = hotel.reviews.reduce((sum, item) => sum + item.rating, 0) / hotel.reviews.length;
        await hotel.save();

        res.json({ data: hotel });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: "Error submitting review" });
    }
};

exports.getMyHotelBookings = async (req, res) => {
    try {
        const bookings = await HotelBookingModel.find({ user: req.user.userId })
            .populate("hotel", "name city pricePerNight")
            .sort({ bookingDate: -1 })
            .lean();
        res.json({ data: bookings });
    } catch (error) {
        console.error("Error fetching hotel bookings:", error);
        res.status(500).json({ message: "Error fetching hotel bookings" });
    }
};
