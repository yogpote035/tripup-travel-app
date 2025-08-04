const FlightModel = require("../../models/FlightModel");
const FlightBookingModel = require("../../models/FlightBookingModel");

module.exports.getFlightsBetweenAirports = async (req, res) => {
  const { from, to, date } = req.query;
  console.log("Request Received in Get B/w Train");
  if (!from || !to || !date) {
    return res.status(406).json({ message: "Missing required fields" });
  }

  try {
    const weekday = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const flights = await FlightModel.find({
      from: { $regex: new RegExp(`^${from}$`, "i") },
      to: { $regex: new RegExp(`^${to}$`, "i") },
      days: weekday,
    });

    if (!flights.length) {
      return res.status(204).json({ message: "No Flights Found" });
    }

    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ message: "Failed to search flights", error });
  }
};

module.exports.bookFlight = async (req, res) => {
  const { flightId, journeyDate, from, to, passengers } = req.body;
  const userId = req.user.userId;

  console.log("Request Received in book B/w Flight");
  console.log(flightId, journeyDate, from, to, passengers);
  console.log("UserId: ", userId);
  if (
    !flightId ||
    !journeyDate ||
    !from ||
    !to ||
    !passengers?.length ||
    !userId
  ) {
    return res
      .status(406)
      .json({ message: "Missing required booking details." });
  }

  try {
    const flightDoc = await FlightModel.findById(flightId);
    if (!flightDoc) {
      return res.status(208).json({ message: "Flight not found." });
    }

    const farePerSeat = flightDoc.price;
    const requestedSeats = passengers.map((p) => p.seatNumber.toUpperCase());

    const alreadyBookedSeats = flightDoc.seats.filter(
      (seat) =>
        seat.isBooked && requestedSeats.includes(seat.seatNumber.toUpperCase())
    );

    if (alreadyBookedSeats.length > 0) {
      return res.status(204).json({
        message: `Seats already booked: ${alreadyBookedSeats
          .map((s) => s.seatNumber)
          .join(", ")}`,
      });
    }

    flightDoc.seats = flightDoc.seats.map((seat) => {
      if (requestedSeats.includes(seat.seatNumber.toUpperCase())) {
        return {
          ...seat.toObject(),
          isBooked: true,
          passengerName:
            passengers.find(
              (p) => p.seatNumber.toUpperCase() === seat.seatNumber
            )?.name || "Unknown",
          bookingTime: new Date(),
        };
      }
      return seat;
    });

    flightDoc.availableSeats -= requestedSeats.length;
    await flightDoc.save();

    const totalFare = farePerSeat * requestedSeats.length;

    const newBooking = new FlightBookingModel({
      user: userId,
      flight: flightId, //flightId
      journeyDate,
      from,
      to,
      farePerSeat,
      totalFare,
      passengers,
    });

    await newBooking.save();

    res.status(200).json({ message: "Flight booked successfully!" });
  } catch (error) {
    console.error("Flight booking error:", error);
    res.status(500).json({ message: "Booking failed", error });
  }
};

exports.getAllFlightBookingsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await FlightBookingModel.find({ user: userId })
      .populate("flight")
      .sort({ bookingDate: -1 });
    if (!bookings) {
      return res
        .status(208)
        .json({ message: "Oop's!, We Don't Get Your Flight Bookings." });
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching flight bookings:", error);
    res.status(500).json({ message: "Failed to fetch flight bookings" });
  }
};
