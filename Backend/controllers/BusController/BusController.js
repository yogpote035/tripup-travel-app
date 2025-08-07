const BusModel = require("../../models/BusModel");
const BusBookingModel = require("../../models/BusBookingModel");
const nodemailer = require("nodemailer");

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

function getStationData(mapOrObj, station) {
  if (mapOrObj instanceof Map) {
    mapOrObj = Object.fromEntries(mapOrObj.entries());
  }

  const matchKey = Object.keys(mapOrObj).find(
    (k) => k.toLowerCase() === station.toLowerCase()
  );
  return matchKey ? mapOrObj[matchKey] : null;
}

module.exports.findBus = async (req, res) => {
  const { source, destination, date } = req.query;
  console.log("Request Query For Find Bus: ", source, destination, date);

  try {
    if (!source || !destination || !date) {
      return res.status(406).json({ message: "Missing required parameters" });
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const buses = await BusModel.find({
      route: {
        $all: [
          new RegExp(`^${source}$`, "i"),
          new RegExp(`^${destination}$`, "i"),
        ],
      },
      days: {
        $in: [new RegExp(`^${dayOfWeek}$`, "i")],
      },
    });
    console.log("Before Filter Bus: ", buses.length);
    if (!buses.length) {
      return res.status(204).json({ message: "No Bus Found" });
    }

    const filtered = buses
      .map((bus) => {
        const route = bus.route.map((r) => r.toLowerCase());
        const sourceIndex = route.indexOf(source.toLowerCase());
        const destIndex = route.indexOf(destination.toLowerCase());

        if (
          sourceIndex === -1 ||
          destIndex === -1 ||
          sourceIndex >= destIndex
        ) {
          return null;
        }

        const sourceData = getStationData(bus.stationMap, source);
        const destData = getStationData(bus.stationMap, destination);

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
          source,
          destination,
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
      return res.status(204).json({ message: "No Bus Found" });
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
    return res.status(406).json({ message: "Missing required booking fields" });
  }

  try {
    const bus = await BusModel.findOne({ busNumber });

    if (!bus) {
      return res.status(204).json({ message: "Bus not found" });
    }

    // Convert Map to plain object
    const stationMap = Object.fromEntries(bus.stationMap);

    // Validate route order
    const route = bus.route.map((r) => r.toLowerCase());
    const sourceIndex = route.indexOf(source.toLowerCase());
    const destIndex = route.indexOf(destination.toLowerCase());

    if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
      return res.status(203).json({ message: "Invalid route sequence" });
    }

    // Get station data safely
    const sourceData = stationMap[source] || stationMap[source.toLowerCase()];
    const destData =
      stationMap[destination] || stationMap[destination.toLowerCase()];

    if (!sourceData || !destData) {
      return res
        .status(203)
        .json({ message: "Invalid source or destination in stationMap" });
    }

    const distance = destData.distance - sourceData.distance;
    const farePerSeat = bus.baseFarePerKm * distance;
    const totalFare = Math.round(farePerSeat * passengers.length);

    // Ensure all requested seats are available
    for (const p of passengers) {
      const seat = bus.seats.find((s) => s.seatNumber === p.seatNumber);
      if (!seat || seat.isBooked) {
        return res.status(203).json({
          message: `Seat ${p.seatNumber} is already booked or doesn't exist.`,
        });
      }
    }

    // Update seat status
    passengers.forEach((p) => {
      const seat = bus.seats.find((s) => s.seatNumber === p.seatNumber);
      seat.isBooked = true;
      seat.passengerName = p.name;
      seat.bookingTime = new Date();
    });

    bus.availableSeats -= passengers.length;
    await bus.save();

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
      status: "booked", //caus an error check
    });

    return res.status(200).json({ message: "Booking successful" });
  } catch (error) {
    console.error("Error during booking:", error);
    return res.status(500).json({ message: "Server error during booking" });
  }
};

module.exports.getMyBusBookings = async (req, res) => {
  try {
    const bookings = await BusBookingModel.find({
      userId: req.header("userId"),
    })
      .populate("bus", "busNumber company")
      .sort({ bookingDate: -1 });

    res.status(200).json(bookings);
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

    const booking = await BusBookingModel.findById(bookingId).populate("bus");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

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
      <div class="section"><span class="label">Bus:</span> ${
        booking.bus.company
      } (${booking.bus.busNumber})</div>
      <div class="section"><span class="label">Route:</span> ${
        booking.source
      } ➝ ${booking.destination}</div>
      <div class="section"><span class="label">Date:</span> ${new Date(
        booking.journeyDate
      ).toDateString()}</div>
      <div class="section"><span class="label">Fare:</span> ₹${
        booking.totalFare
      } (₹${booking.farePerSeat}/seat)</div> 
       <div class="section"><span class="label">Status:</span> ${
         booking.status
       }</div>

      <div class="section">
        <span class="label">Passengers:</span>
        <ul>
          ${booking.passengers
            .map(
              (p, i) =>
                `<li>${i + 1}. ${p.name} - Seat ${p.seatNumber} (${
                  p.gender
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
    const booking = await BusBookingModel.findById(bookingId).populate("bus");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

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
      <div class="section"><span class="label">Bus:</span> ${
        booking.bus.company
      } (${booking.bus.busNumber})</div>
      <div class="section"><span class="label">Route:</span> ${
        booking.source
      } ➝ ${booking.destination}</div>
      <div class="section"><span class="label">Date:</span> ${new Date(
        booking.journeyDate
      ).toDateString()}</div>
      <div class="section"><span class="label">Fare:</span> ₹${
        booking.totalFare
      } (₹${booking.farePerSeat}/seat)</div> 
       <div class="section"><span class="label">Status:</span> ${
         booking.status
       }</div>
      <div class="section">
        <span class="label">Passengers:</span>
        <ul>
          ${booking.passengers
            .map(
              (p, i) =>
                `<li>${i + 1}. ${p.name} - Seat ${p.seatNumber} (${
                  p.gender
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
        seat.passengerName = null;
        seat.bookingTime = null;
      }
    });

    await bus.save();

    booking.status = "cancelled";
    await booking.save(); //for storing History we don't delete it

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
