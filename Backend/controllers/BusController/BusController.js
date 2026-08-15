const BusModel = require("../../models/BusModel");
const BusBookingModel = require("../../models/BusBookingModel");
const nodemailer = require("nodemailer");
const { sendNotification } = require('../../utils/socket');
const Razorpay = require("razorpay");
const { getConfig } = require("../../config/environment");
const { verifyCheckoutSignature } = require("../../services/payment/RazorpayPaymentService");
const { confirmExistingBooking } = require("../../services/payment/UniversalConfirmationService");
const config = getConfig();
const razorpayClient = config.razorpay?.keyId && config.razorpay?.keySecret
  ? new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret }) : null;

function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    return { hours: 0, minutes: 0 };
  }

  const time = timeStr.trim().toUpperCase();
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridian = timeMatch[3];

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  const [h, m] = time.split(":").map(Number);
  return {
    hours: isNaN(h) ? 0 : h,
    minutes: isNaN(m) ? 0 : m,
  };
}

function addDuration(baseTime, durationStr) {
  if (!durationStr) return "00:00";
  const parts = durationStr.split(" ");
  const hPart = parts.find((p) => p.includes("h")) || "0h";
  const mPart = parts.find((p) => p.includes("m")) || "0m";

  const addHours = parseInt(hPart.replace("h", ""), 10) || 0;
  const addMinutes = parseInt(mPart.replace("m", ""), 10) || 0;

  let totalMinutes = baseTime.minutes + addMinutes;
  let totalHours = baseTime.hours + addHours + Math.floor(totalMinutes / 60);
  totalMinutes %= 60;
  totalHours %= 24;

  return `${totalHours.toString().padStart(2, "0")}:${totalMinutes
    .toString()
    .padStart(2, "0")}`;
}

function toStationMap(mapOrObj) {
  if (!mapOrObj) return {};
  if (mapOrObj instanceof Map) return Object.fromEntries(mapOrObj.entries());
  if (typeof mapOrObj === "object") return { ...mapOrObj };
  return {};
}

function normalizeStationName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function getStationData(mapOrObj, station) {
  const normalizedMap = toStationMap(mapOrObj);
  const matchKey = Object.keys(normalizedMap).find(
    (k) => normalizeStationName(k) === normalizeStationName(station)
  );
  return matchKey ? normalizedMap[matchKey] : null;
}

module.exports.__test__ = {
  toStationMap,
  normalizeStationName,
};

module.exports.findBus = async (req, res) => {
  const { source, destination, date } = req.query;
  const normalizedSource = normalizeStationName(source);
  const normalizedDestination = normalizeStationName(destination);
  console.log("Request Query For Find Bus: ", source, destination, date);

  try {
    if (!normalizedSource || !normalizedDestination || !date) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const normalizedSourceLabel = String(source || "").trim();
    const normalizedDestinationLabel = String(destination || "").trim();
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    let buses = await BusModel.find({
      route: {
        $all: [
          new RegExp(`^${normalizedSourceLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
          new RegExp(`^${normalizedDestinationLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        ],
      },
      days: {
        $in: [new RegExp(`^${dayOfWeek}$`, "i"), /^Daily$/i],
      },
    });
    // SQL compatibility layers may not apply Mongo-style $all/$in operators
    // consistently to JSON columns. Fall back to a JS filter over the loaded
    // rows so valid buses (including Daily schedules) remain searchable.
    if (!buses.length) {
      const allBuses = await BusModel.find({}).lean();
      buses = allBuses.filter((bus) => {
        const route = Array.isArray(bus.route) ? bus.route.map((stop) => normalizeStationName(stop)) : [];
        const days = Array.isArray(bus.days) ? bus.days.map(String) : [];
        return route.includes(normalizedSource)
          && route.includes(normalizedDestination)
          && (!days.length || days.some((day) => /^daily$/i.test(day) || new RegExp(`^${dayOfWeek}$`, "i").test(day)));
      });
    }
    console.log("Before Filter Bus: ", buses.length);
    if (!buses.length) {
      return res.status(200).json([]);
    }

    const filtered = buses
      .map((bus) => {
        const route = (Array.isArray(bus.route) ? bus.route : []).map((r) => normalizeStationName(r));
        const sourceIndex = route.indexOf(normalizedSource);
        const destIndex = route.indexOf(normalizedDestination);

        if (
          sourceIndex === -1 ||
          destIndex === -1 ||
          sourceIndex >= destIndex
        ) {
          return null;
        }

        const sourceData = getStationData(bus.stationMap, normalizedSourceLabel);
        const destData = getStationData(bus.stationMap, normalizedDestinationLabel);

        if (!sourceData || !destData) return null;

        const distance = destData.distance - sourceData.distance;
        const fare = Math.round(distance * bus.baseFarePerKm);

        const baseTime = parseTimeString(bus.departureTime);
        const departureAt = addDuration(baseTime, sourceData.duration);
        const arrivalAt = addDuration(baseTime, destData.duration);
        // console.log("Route:", bus.route);
        // console.log("SourceIndex:", sourceIndex, "DestIndex:", destIndex);
        // console.log("SourceData:", sourceData);
        // console.log("DestData:", destData);

        return {
          busId: bus._id,
          busNumber: bus.busNumber,
          company: bus.company,
          type: bus.type,
          route: bus.route,
          totalSeats: bus.totalSeats,
          availableSeats: bus.availableSeats,
          source: normalizedSourceLabel,
          destination: normalizedDestinationLabel,
          distance,
          fare,
          departureAt,
          arrivalAt,
          journeyDate: date,
          duration: bus.duration,
          seats: bus.seats,
        };
      })
      .filter(Boolean);
    console.log("After Filter Bus: ", filtered.length);
    if (!filtered.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Bus search error:", error);
    res.status(500).json({ message: "Error fetching buses" });
  }
};

module.exports.bookBusSeats = async (req, res) => {
  const {
    busNumber,
    journeyDate,
    source,
    destination,
    passengers = [],
  } = req.body;

  if (
    !busNumber ||
    !journeyDate ||
    !source ||
    !destination ||
    passengers.length === 0 ||
    !req.header("userId")
  ) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  try {
    const bus = await BusModel.findOne({ busNumber });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Convert Map to plain object safely for both Map and plain-object storage
    const stationMap = toStationMap(bus.stationMap);

    // Validate route order
    const route = bus.route.map((r) => r.toLowerCase());
    const sourceIndex = route.indexOf(source.toLowerCase());
    const destIndex = route.indexOf(destination.toLowerCase());

    if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
      return res.status(400).json({
        message: "Invalid route sequence",
        code: "INVALID_ROUTE_SEQUENCE",
        busRoute: bus.route,
        requested: { source, destination }
      });
    }

    // Get station data safely using case-insensitive lookup
    const sourceData = getStationData(stationMap, source);
    const destData = getStationData(stationMap, destination);

    if (!sourceData || !destData) {
      const availableStations = Object.keys(stationMap).join(", ");
      return res.status(400).json({
        message: "Invalid source or destination",
        code: "STATION_NOT_FOUND",
        availableStations,
        requested: { source, destination }
      });
    }

    const distance = destData.distance - sourceData.distance;
    const farePerSeat = bus.baseFarePerKm * distance;
    const totalFare = Math.round(farePerSeat * passengers.length);

    // Ensure all requested seats are available
    for (const p of passengers) {
      const seat = bus.seats.find((s) => s.seatNumber === p.seatNumber);
      if (!seat || seat.isBooked || (seat.status && seat.status !== "Available")) {
        return res.status(409).json({
          message: `Seat ${p.seatNumber} is already booked or doesn't exist.`,
        });
      }
    }

    const booking = await BusBookingModel.create({
      bus: bus._id,
      userId: req.header("userId"),
      journeyDate,
      source,
      destination,
      distance,
      farePerSeat: Math.round(farePerSeat),
      totalFare,
      passengers,
      status: "pending",
      payment: { provider: "razorpay", status: "pending", originalMethod: req.body.paymentMethod || null },
    });
    if (!razorpayClient) return res.status(500).json({ message: "Razorpay is not configured on the server." });
    const order = await razorpayClient.orders.create({
      amount: Math.round(totalFare * 100), currency: "INR", receipt: `bus_booking_${booking._id}`, payment_capture: 1,
      notes: { bookingId: booking._id.toString(), bookingType: "bus" },
    });
    booking.payment = { ...booking.payment, orderId: order.id };
    await booking.save();
    return res.status(201).json({ message: "Payment required to complete booking", data: { booking, payment: { order, paymentKeyId: config.razorpay.keyId } } });
  } catch (error) {
    console.error("Error during booking:", error);
    return res.status(500).json({ message: "Server error during booking" });
  }
};

module.exports.confirmBusBooking = async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) return res.status(400).json({ message: "Payment verification fields are required" });
    const booking = await BusBookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Pending bus booking not found" });
    if (String(booking.userId) !== String(req.user?.userId)) return res.status(403).json({ message: "You are not authorized to confirm this booking" });
    if (!verifyCheckoutSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) return res.status(400).json({ message: "Payment verification failed" });
    const confirmed = await confirmExistingBooking({ bookingId, bookingType: "bus", payment: { id: razorpay_payment_id }, orderId: razorpay_order_id });
    return res.json({ booking: confirmed, message: "Bus booking successful" });
  } catch (error) {
    console.error("Bus booking confirmation failed:", error.message);
    return res.status(500).json({ message: "Bus booking confirmation failed" });
  }
};

module.exports.getMyBusBookings = async (req, res) => {
  try {
    const bookings = await BusBookingModel.find({
      userId: req.header("userId"),
    }).sort({ bookingDate: -1 }).lean();

    const busIds = [...new Set(bookings.map((booking) => booking && (booking.bus || booking.busId)).filter(Boolean))];
    const busMap = new Map(
      (await Promise.all(busIds.map(async (busId) => BusModel.findById(busId)))).filter(Boolean).map((bus) => [(bus._id || bus.id), bus])
    );

    const enrichedBookings = bookings.map((booking) => {
      if (booking && booking.bus && busMap.has(booking.bus)) {
        booking.bus = busMap.get(booking.bus);
      }
      return booking;
    });

    res.status(200).json(enrichedBookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

module.exports.downloadTicket = async (req, res) => {
  const { bookingId } = req.query;

  try {
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await BusBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bus = booking.bus ? await BusModel.findById(booking.bus) : null;
    if (bus) booking.bus = bus;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bus Ticket</title>
    <style>
      body {
            font-family: Arial, sans-serif;
            padding: 10px;
            font-size: 12px;
          }
          .ticket {
            border: 1px dashed #444;
            padding: 10px;
            border-radius: 5px;
            background-color: #fff;
          }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }
      .section {
        margin-bottom: 5px;
      }
      .label {
        font-weight: bold;
        color: #333;
      }
      ul {
        margin: 5px 0 0 15px;
        padding: 0;
      }
      li {
        line-height: 1.4;
      }
    </style>
  </head>
  <body>
  <div class="header"> Bus Ticket</div>
    <div class="ticket">
      <div class="section"><span class="label">Bus:</span> ${booking.bus.company
      } (${booking.bus.busNumber})</div>
      <div class="section"><span class="label">Route:</span> ${booking.source
      } ➝ ${booking.destination}</div>
      <div class="section"><span class="label">Date:</span> ${new Date(
        booking.journeyDate
      ).toDateString()}</div>
      <div class="section"><span class="label">Fare:</span> ₹${booking.totalFare
      } (₹${booking.farePerSeat}/seat)</div> 
       <div class="section"><span class="label">Status:</span> ${booking.status
      }</div>

      <div class="section">
        <span class="label">Passengers:</span>
        <ul>
          ${booking.passengers
        .map(
          (p, i) =>
            `<li>${i + 1}. ${p.name} - Seat ${p.seatNumber} (${p.gender
            })</li>`
        )
        .join("")}
        </ul>
      </div>
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
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      width: "5in", // Small receipt-like width
      height: "3.5in", // Custom height
      printBackground: true,
      margin: {
        top: "10px",
        bottom: "10px",
        left: "15px",
        right: "15px",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=bus-ticket-${bookingId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports.mailTicket = async (req, res) => {
  const { bookingId } = req.query;

  try {
    const booking = await BusBookingModel.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const bus = booking.bus ? await BusModel.findById(booking.bus) : null;
    if (bus) booking.bus = bus;

    // Generate PDF
    const html = `
     <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bus Ticket</title>
    <style>
      body {
            font-family: Arial, sans-serif;
            padding: 10px;
            font-size: 12px;
          }
          .ticket {
            border: 1px dashed #444;
            padding: 10px;
            border-radius: 5px;
            background-color: #fff;
          }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }
      .section {
        margin-bottom: 5px;
      }
      .label {
        font-weight: bold;
        color: #333;
      }
      ul {
        margin: 5px 0 0 15px;
        padding: 0;
      }
      li {
        line-height: 1.4;
      }
    </style>
  </head>
  <body>
  <div class="header"> Bus Ticket</div>
    <div class="ticket">
      <div class="section"><span class="label">Bus:</span> ${booking.bus.company
      } (${booking.bus.busNumber})</div>
      <div class="section"><span class="label">Route:</span> ${booking.source
      } ➝ ${booking.destination}</div>
      <div class="section"><span class="label">Date:</span> ${new Date(
        booking.journeyDate
      ).toDateString()}</div>
      <div class="section"><span class="label">Fare:</span> ₹${booking.totalFare
      } (₹${booking.farePerSeat}/seat)</div> 
       <div class="section"><span class="label">Status:</span> ${booking.status
      }</div>
      <div class="section">
        <span class="label">Passengers:</span>
        <ul>
          ${booking.passengers
        .map(
          (p, i) =>
            `<li>${i + 1}. ${p.name} - Seat ${p.seatNumber} (${p.gender
            })</li>`
        )
        .join("")}
        </ul>
      </div>
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
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      width: "5in", // Small receipt-like width
      height: "3.5in", // Custom height
      printBackground: true,
      margin: {
        top: "10px",
        bottom: "10px",
        left: "15px",
        right: "15px",
      },
    });
    await browser.close();

    // Email config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: booking.passengers[0].email,
      subject: "Your Bus Ticket",
      text: "Find your ticket attached.",
      attachments: [
        {
          filename: `ticket-${bookingId}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Ticket emailed successfully!" });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports.cancelBusBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await BusBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bus = await BusModel.findById(booking.bus);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    booking.passengers.forEach((passenger) => {
      const seat = bus.seats.find((s) => s.seatNumber === passenger.seatNumber);
      if (seat) {
        seat.isBooked = false;
        seat.status = "Available";
        seat.passengerName = null;
        seat.bookingTime = null;
      }
    });

    await bus.save();

    booking.status = "cancelled";
    await booking.save(); //for storing History we don't delete it

    try {
      await sendNotification(booking.userId, { type: 'booking_cancelled', title: 'Bus Booking Cancelled', message: `Your bus booking for ${booking.journeyDate?.toString?.() || ''} has been cancelled`, meta: { bookingId: booking._id, busId: booking.bus } });
    } catch (err) {
      console.error('notify error', err.message);
    }

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
