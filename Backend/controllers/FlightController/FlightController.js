const FlightModel = require("../../models/FlightModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const nodemailer = require("nodemailer");
const { sendNotification } = require('../../utils/socket');
const { logger } = require("../../Middleware/Logger");

const toPlainSeat = (seat) => (seat && typeof seat.toObject === "function" ? seat.toObject() : { ...seat });
const normalizeSeatNumber = (value) => String(value ?? "").trim().toUpperCase();

function markSeatsBooked(seats, requestedSeats, passengers) {
  const requestedSet = new Set((requestedSeats || []).map(normalizeSeatNumber));

  return seats.map((seat) => {
    const seatNumber = normalizeSeatNumber(seat?.seatNumber);
    if (!requestedSet.has(seatNumber)) return seat;
    const passenger = passengers.find((entry) => normalizeSeatNumber(entry?.seatNumber) === seatNumber);

    return {
      ...toPlainSeat(seat),
      isBooked: true,
      status: "Booked",
      passengerName: passenger?.name || "Unknown",
      bookingTime: new Date(),
    };
  });
}

module.exports.getFlightsBetweenAirports = async (req, res) => {
  const { from, to, date } = req.query;
  console.log("Request received in flight search");
  if (!from || !to || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const searchDate = new Date(`${date}T12:00:00`);
    if (Number.isNaN(searchDate.getTime())) {
      return res.status(400).json({ message: "Invalid journey date" });
    }
    const weekday = searchDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const flights = await FlightModel.find({
      from: { $regex: new RegExp(`^${from}$`, "i") },
      to: { $regex: new RegExp(`^${to}$`, "i") },
      days: weekday,
    });

    if (!flights.length) {
      return res.status(200).json({ flights: [] });
    }

    res.status(200).json({ flights, from, to, date });
  } catch (error) {
    logger.error("Flight search failed", {
      requestId: req.requestId,
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      stack: error.stack,
      from,
      to,
      date,
    });
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
    return res.status(400).json({ message: "Missing required booking details." });
  }

  try {
    const flightDoc = await FlightModel.findById(flightId);
    if (!flightDoc) {
      return res.status(404).json({ message: "Flight not found." });
    }

    const farePerSeat = flightDoc.price;
    const requestedSeats = passengers.map((passenger) => normalizeSeatNumber(passenger?.seatNumber));
    if (requestedSeats.some((seatNumber) => !seatNumber) || new Set(requestedSeats).size !== requestedSeats.length) {
      return res.status(400).json({ message: "Passenger seat numbers must be present and unique" });
    }

    const unavailableSeats = flightDoc.seats.filter(
      (seat) =>
        requestedSeats.includes(normalizeSeatNumber(seat.seatNumber)) && (seat.isBooked || (seat.status && seat.status !== "Available"))
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        message: `Seats unavailable: ${unavailableSeats
          .map((s) => s.seatNumber)
          .join(", ")}`,
      });
    }

    flightDoc.seats = markSeatsBooked(flightDoc.seats, requestedSeats, passengers);

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
      status: "booked", //caus an error check
    });

    await newBooking.save();
    // send notification to user
    try {
      await sendNotification(userId, { type: 'booking_confirmed', title: 'Flight Booked', message: `Your flight booking is confirmed for ${journeyDate}`, meta: { bookingId: newBooking._id, flightId: flightId } });
    } catch (e) { console.error('notify error', e.message); }

    res.status(200).json({ message: "Flight booked successfully!" });
  } catch (error) {
    console.error("Flight booking error:", error);
    res.status(500).json({ message: "Booking failed", error });
  }
};

module.exports.__test__ = { markSeatsBooked };

exports.getAllFlightBookingsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await FlightBookingModel.find({ user: userId }).lean();
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const flight = booking.flight ? await FlightModel.findById(booking.flight) : null;
        return { ...booking, flight: flight || null };
      })
    );

    res.status(200).json(enrichedBookings);
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
    const booking = await FlightBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(208).json({ message: "Booking not found" });
    }

    const flight = booking.flight ? await FlightModel.findById(booking.flight) : null;
    const enrichedBooking = { ...booking, flight: flight || null };

    const passengerRows = enrichedBooking.passengers
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
          <h1> Flight Ticket - TripUp</h1>
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
          <p><strong>Status:</strong> ${booking.status}</p>

          <h2> Passenger Details</h2>
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

    let puppeteer, browser;

    if (process.env.NODE_ENV === "production") {
      puppeteer = require("puppeteer-core");
      const chromium = require("@sparticuz/chromium");

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      puppeteer = require("puppeteer");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

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
    const booking = await FlightBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const flight = booking.flight ? await FlightModel.findById(booking.flight) : null;
    const enrichedBooking = { ...booking, flight: flight || null };

    const passengerRows = enrichedBooking.passengers
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
          <h1> Flight Ticket - TripUp</h1>
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
          <p><strong>Status:</strong> ${booking.status}</p>

          <h2> Passenger Details</h2>
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

    let puppeteer, browser;

    if (process.env.NODE_ENV === "production") {
      puppeteer = require("puppeteer-core");
      const chromium = require("@sparticuz/chromium");

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      puppeteer = require("puppeteer");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

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

    //  Send email
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

module.exports.cancelFlightBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await FlightBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const flight = await FlightModel.findById(booking.flight);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Un-mark booked seats
    booking.passengers.forEach((passenger) => {
      const seat = flight.seats.find(
        (s) => s.seatNumber === passenger.seatNumber
      );
      if (seat) {
        seat.isBooked = false;
        seat.status = "Available";
        seat.passengerName = null;
        seat.bookingTime = null;
      }
    });

    // Update seats
    flight.availableSeats += booking.passengers.length;

    await flight.save();

    // Update booking status instead of deleting bcz i went user history
    booking.status = "cancelled";
    await booking.save();

    try {
      await sendNotification(booking.user, { type: 'booking_cancelled', title: 'Flight Booking Cancelled', message: `Your flight booking for ${booking.journeyDate?.toString?.() || ''} has been cancelled`, meta: { bookingId: booking._id, flightId: booking.flight } });
    } catch (err) {
      console.error('notify error', err.message);
    }

    return res
      .status(200)
      .json({ message: "Flight booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel flight booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
