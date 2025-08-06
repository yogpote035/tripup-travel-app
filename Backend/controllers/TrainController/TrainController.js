const TrainBookingModel = require("../../models/TrainBookingModel");
const UserModel = require("../../models/UserModel");
const TrainModel = require("../../models/TrainModel");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const validateEmail = require("../../Middleware/validateEmail");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");

const getDistance = (train, from, to) => {
  const stationDistances = Object.fromEntries(train.stationDistances);
  const fromKey = Object.keys(stationDistances).find(
    (key) => key.toLowerCase() === from.toLowerCase()
  );
  const toKey = Object.keys(stationDistances).find(
    (key) => key.toLowerCase() === to.toLowerCase()
  );

  const fromDist = stationDistances[fromKey];
  const toDist = stationDistances[toKey];

  return fromDist != null && toDist != null && fromDist < toDist
    ? toDist - fromDist
    : 0;
};

module.exports.TrainBetween = async (req, res) => {
  const { from, to, day, trainType } = req.query;

  if (!from || !to) {
    return res.status(406).json({ message: "Please Provide Parameters" });
  }

  const fromClean = from.trim().toLowerCase();
  const toClean = to.trim().toLowerCase();

  try {
    const trains = await TrainModel.find({
      route: {
        $all: [new RegExp(`^${from}$`, "i"), new RegExp(`^${to}$`, "i")],
      },
      ...(day && {
        days: { $in: [new RegExp(`^${day}$`, "i"), /^Daily$/i] },
      }),
      ...(trainType && { trainType: new RegExp(`^${trainType}$`, "i") }),
    });

    const validTrains = trains
      .map((train) => {
        const fromIndex = train.route.findIndex(
          (station) => station.toLowerCase() === fromClean
        );
        const toIndex = train.route.findIndex(
          (station) => station.toLowerCase() === toClean
        );

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
          return null;
        }

        const distance = getDistance(train, from, to);

        const updatedCoaches = train.coaches.map((coach) => ({
          ...coach._doc,
          fare: parseFloat((Number(coach.baseFarePerKm) * distance).toFixed(2)),
        }));

        return {
          ...train._doc,
          coaches: updatedCoaches,
          distance,
        };
      })
      .filter(Boolean);

    if (!validTrains.length) {
      return res
        .status(208)
        .json({ message: `No Train Found from ${from} to ${to}` });
    }

    return res.status(200).json(validTrains);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.bookTrain = async (req, res) => {
  const {
    userId,
    trainNumber,
    coachType,
    passengerNames,
    from,
    to,
    journeyDate,
    email,
    phone,
  } = req.body;

  if (
    !trainNumber ||
    !coachType ||
    !passengerNames ||
    !from ||
    !to ||
    !journeyDate ||
    !userId
  ) {
    return res.status(400).json({ message: "Missing booking data" });
  }

  console.log("before userEmail Email is Form Booking :", email);

  // Fallback to user info from UserModel
  let userEmail = email ? email : null;
  let userPhone = phone ? phone : null;

  if ((!email || !phone) && userId) {
    const user = await UserModel.findById(userId);

    //if user not found
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (!email && user) {
      userEmail = user.email;
    }
    if (!phone && user) {
      userPhone = user.phone;
    }
  }

  console.log("After userEmail Email is Form Booking :", userEmail);

  console.log("user phone before validate :", userPhone);

  const result = PhoneNumberValidator(userPhone);

  console.log("user phone After validate :", userPhone);

  if (!result.isValid) {
    return res.status(406).json({ message: "Invalid phone number" });
  }
  console.log("Before formatted phone from signup ");
  console.log(userPhone);
  userPhone = result.formatted; // formate number
  console.log("After formatted phone from signup ");
  console.log(userPhone);

  const isEmailValid = await validateEmail(userEmail);

  if (!isEmailValid) {
    return res
      .status(406)
      .json({ message: "Email does not appear to be valid." });
  }

  try {
    const train = await TrainModel.findOne({ trainNumber });
    if (!train) return res.status(404).json({ message: "Train not found" });

    const distance = getDistance(train, from, to);
    const selectedCoach = train.coaches.find(
      (c) => c.coachType.toLowerCase() === coachType.toLowerCase()
    );
    if (!selectedCoach)
      return res.status(404).json({ message: "Coach not found" });

    const availableSeats = selectedCoach.seats.filter((s) => !s.isBooked);

    if (availableSeats.length < passengerNames.length) {
      return res.status(409).json({ message: "Not enough seats available" });
    }

    // Seat Allocation
    let seatToBook = [];

    // If only one → random
    if (passengerNames.length === 1) {
      seatToBook.push(
        availableSeats[Math.floor(Math.random() * availableSeats.length)]
      );
    } else {
      // Try continuous seats
      for (let i = 0; i <= availableSeats.length - passengerNames.length; i++) {
        const group = availableSeats.slice(i, i + passengerNames.length);
        const isContinuous = group.every(
          (s, idx, arr) =>
            idx === 0 || s.seatNumber === arr[idx - 1].seatNumber + 1
        );
        if (isContinuous) {
          seatToBook = group;
          break;
        }
      }

      // Fallback: pick first N available
      if (seatToBook.length === 0) {
        seatToBook = availableSeats.slice(0, passengerNames.length);
      }
    }

    // Update seat in TrainModel
    seatToBook.forEach((seat, i) => {
      const seatInTrain = selectedCoach.seats.find((s) =>
        s._id.equals(seat._id)
      );
      seatInTrain.isBooked = true;
      seatInTrain.passengerName = passengerNames[i];
      seatInTrain.bookingTime = new Date();
    });

    selectedCoach.availableSeats -= passengerNames.length;
    await train.save();

    const fare =
      Math.round(selectedCoach.baseFarePerKm * distance) *
      passengerNames.length;

    const booking = await TrainBookingModel.create({
      user: userId,
      trainNumber,
      trainName: train.trainName,
      coachType,
      seatNumbers: seatToBook.map((seat) => seat.seatNumber),
      passengerNames,
      from,
      to,
      journeyDate,
      fare,
      email: userEmail,
      phone: userPhone,
    });

    return res.status(201).json({
      message: "Booking successful",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
};

module.exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.header("userId");

    if (!userId) {
      return res.status(406).json({ message: "Please Provide Parameters" });
    }
    const bookings = await TrainBookingModel.find({ user: userId }).sort({
      bookedAt: -1,
    });

    if (!bookings.length) {
      return res
        .status(208)
        .json({ message: "Oh! no, Sorry We Didn't Get Your Memories" });
    }

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
};

module.exports.generateReceiptPdf = async (req, res) => {
  try {
    const bookingId = req.query.bookingId;

    if (!bookingId) {
      return res.status(406).json({ message: "Please Provide Booking ID" });
    }

    const booking = await TrainBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Oh! no, We Didn't Get Your Travel Memory to Write It in File",
      });
    }
    // this is finale
    const ticketData = {
      trainName: booking.trainName,
      trainNumber: booking.trainNumber,
      from: booking.from,
      to: booking.to,
      date: new Date(booking.journeyDate).toDateString(),
      coach: booking.coachType,
      fare: booking.fare,
      phone: booking.phone,
      email: booking.email,
      passengers: booking.passengerNames.map((name, index) => ({
        name,
        seat: booking.seatNumbers[index] || "N/A",
      })),
    };

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Train Ticket</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 10px;
        font-size: 12px;
        color: #333;
      }
      .ticket {
        border: 1px dashed #444;
        padding: 10px;
        border-radius: 5px;
        background-color: #fff;
      }
      .mainHeading {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #08111a;
        text-align: center;
      }
      .title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #2c3e50;
      }
      .info {
        margin-bottom: 6px;
      }
      .passengers {
        margin-top: 10px;
      }
      .passengers p {
        margin: 2px 0;
      }
    </style>
  </head>
  <body>
    <div class="mainHeading">Train Ticket</div>
    <div class="ticket">
      <div class="title">${ticketData.trainName} (${
      ticketData.trainNumber
    })</div>
      <div class="info"><strong>Route:</strong> ${ticketData.from} ➝ ${
      ticketData.to
    }</div>
      <div class="info"><strong>Date:</strong> ${ticketData.date}</div>
      <div class="info"><strong>Coach:</strong> ${ticketData.coach}</div>
      <div class="info"><strong>Fare:</strong> ₹${ticketData.fare}</div>
      <div class="info"><strong>Phone:</strong> ${ticketData.phone}</div>
      <div class="info"><strong>Email:</strong> ${ticketData.email}</div>
      <div class="passengers">
        <strong>Passengers:</strong>
        ${ticketData.passengers
          .map(
            (p, i) =>
              `<p>${i + 1}. ${p.name} - Seat: <strong>${p.seat}</strong></p>`
          )
          .join("")}
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
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "5in",
      height: "3.5in",
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
      "Content-Disposition": 'attachment; filename="ticket.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

// send Ticket To MAil
exports.mailTrainTicket = async (req, res) => {
  try {
    const bookingId = req.query.bookingId;

    if (!bookingId) {
      return res.status(406).json({ message: "Please Provide Booking ID" });
    }
    const booking = await TrainBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Oh! no, We Didn't Sent Your Travel Memory to Mail",
      });
    }

    const ticketData = {
      trainName: booking.trainName,
      trainNumber: booking.trainNumber,
      from: booking.from,
      to: booking.to,
      date: new Date(booking.journeyDate).toDateString(),
      coach: booking.coachType,
      fare: booking.fare,
      phone: booking.phone,
      email: booking.email,
      passengers: booking.passengerNames.map((name, i) => ({
        name,
        seat: booking.seatNumbers[i] || "N/A",
      })),
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
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
          .mainHeading {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #08111a;
            text-align: center;
          }
          .passengers p {
            margin: 2px 0;
          }
        </style>
      </head>
      <body>
        <div class="mainHeading">Train Ticket</div>
        <div class="ticket">
          <p><strong>${ticketData.trainName} (${
      ticketData.trainNumber
    })</strong></p>
          <p><strong>From:</strong> ${ticketData.from}</p>
          <p><strong>To:</strong> ${ticketData.to}</p>
          <p><strong>Date:</strong> ${ticketData.date}</p>
          <p><strong>Coach:</strong> ${ticketData.coach}</p>
          <p><strong>Fare:</strong> ₹${ticketData.fare}</p>
          <p><strong>Phone:</strong> ${ticketData.phone}</p>
          <p><strong>Email:</strong> ${ticketData.email}</p>
          <div class="passengers">
            <strong>Passengers:</strong>
            ${ticketData.passengers
              .map((p, i) => `<p>${i + 1}. ${p.name} - Seat: ${p.seat}</p>`)
              .join("")}
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
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "5in",
      height: "3.5in",
      printBackground: true,
    });

    await browser.close();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Train Booking" <${process.env.MAIL_USER}>`,
      to: booking.email,
      subject: "Your Train Ticket",
      text: "Attached is your train ticket.",
      attachments: [
        {
          filename: `Ticket-${ticketData.trainNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.status(200).json({ message: "Ticket emailed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send ticket via email" });
  }
};
