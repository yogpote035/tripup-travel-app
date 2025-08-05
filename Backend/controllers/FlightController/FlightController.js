const FlightModel = require("../../models/FlightModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

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

    res.status(200).json({ flights, from, to, date });
  } catch (error) {
    res.status(500).json({ message: "Failed to search flights", error });
  }
};

module.exports.bookFlight = async (req, res) => {
  const { flightId, journeyDate, from, to, passengers } = req.body;
  const userId = req.user.userId;

  console.log("Request Received in book Flight");
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

module.exports.downloadFlightTicket = async (req, res) => {
  const { bookingId } = req.query;

  if (!bookingId) {
    return res
      .status(204)
      .json({ message: "Sorry!, BookingId is Not Provided" });
  }

  try {
    const booking = await FlightBookingModel.findById(bookingId).populate(
      "flight"
    );

    if (!booking) {
      return res.status(208).json({ message: "Booking not found" });
    }

    const passengerRows = booking.passengers
      .map(
        (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.name}</td>
          <td>${p.gender}</td>
          <td>${p.seatNumber}</td>
          <td>${p.email}</td>
          <td>${p.phone}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 2px; color: #333; }
            h1, h2 { color: #004080; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>🛫 Flight Ticket - TripUp</h1>
          <p><strong>Airline:</strong> ${booking.flight.airline}</p>
          <p><strong>Flight Number:</strong> ${booking.flight.flightNumber}</p>
          <p><strong>From:</strong> ${booking.from}</p>
          <p><strong>To:</strong> ${booking.to}</p>
          <p><strong>Journey Date:</strong> ${new Date(
            booking.journeyDate
          ).toDateString()}</p>
          <p><strong>Booking Date:</strong> ${new Date(
            booking.bookingDate
          ).toDateString()}</p>
          <p><strong>Total Fare:</strong> ₹${booking.totalFare}</p>

          <h2>🧑‍🤝‍🧑 Passenger Details</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Seat</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${passengerRows}
            </tbody>
          </table>

          <div class="footer">
            <p>This ticket is auto-generated by TripUp. Please carry a valid ID proof during boarding.</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "7.5in", // Custom size similar to email layout
      height: "7.2in",
      printBackground: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "30px",
        right: "30px",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${bookingId}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Download Flight Ticket Error:", err);
    res
      .status(500)
      .json({ message: "Failed to generate ticket", error: err.message });
  }
};

module.exports.MailFlightTicket = async (req, res) => {
  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID is required." });
  }

  try {
    const booking = await FlightBookingModel.findById(bookingId).populate(
      "flight"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const passengerRows = booking.passengers
      .map(
        (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.name}</td>
          <td>${p.gender}</td>
          <td>${p.seatNumber}</td>
          <td>${p.email}</td>
          <td>${p.phone}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1, h2 { color: #004080; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>🛫 Flight Ticket - TripUp</h1>
          <p><strong>Airline:</strong> ${booking.flight.airline}</p>
          <p><strong>Flight Number:</strong> ${booking.flight.flightNumber}</p>
          <p><strong>From:</strong> ${booking.from}</p>
          <p><strong>To:</strong> ${booking.to}</p>
          <p><strong>Journey Date:</strong> ${new Date(
            booking.journeyDate
          ).toDateString()}</p>
          <p><strong>Booking Date:</strong> ${new Date(
            booking.bookingDate
          ).toDateString()}</p>
          <p><strong>Total Fare:</strong> ₹${booking.totalFare}</p>

          <h2>🧑‍🤝‍🧑 Passenger Details</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Seat</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${passengerRows}
            </tbody>
          </table>

          <div class="footer">
            <p>This ticket is auto-generated by TripUp. Please carry a valid ID proof during boarding.</p>
          </div>
        </body>
      </html>
    `;

    // Create PDF with custom A4 size
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "7.5in", 
      height: "7.2in",
      printBackground: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "30px",
        right: "30px",
      },
    });

    await browser.close();

    // 📧 Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"TripUp Booking" <${process.env.MAIL_USER}>`,
      to: booking.passengers[0].email,
      subject: "Your Flight Ticket - TripUp",
      text: `Dear ${booking.passengers[0].name},\n\nYour flight ticket is attached. Safe travels!`,
      attachments: [
        {
          filename: `FlightTicket-${booking._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Ticket mailed successfully!" });
  } catch (err) {
    console.error("Mail Flight Ticket Error:", err);
    res
      .status(500)
      .json({ message: "Failed to mail ticket", error: err.message });
  }
};
