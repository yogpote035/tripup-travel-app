const TrainBookingModel = require("../../models/TrainBookingModel");
const UserModel = require("../../models/UserModel");
const TrainModel = require("../../models/TrainModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validateEmail = require("../../Middleware/validateEmail");
const PhoneNumberValidator = require("../../Middleware/PhoneNumberValidator");
const { sendNotification } = require('../../utils/socket');
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

function pickRandomSeats(availableSeats = [], requiredCount = 1) {
  if (!Array.isArray(availableSeats) || !availableSeats.length) return [];

  const shuffled = [...availableSeats].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, Math.min(requiredCount, shuffled.length));

  return chosen;
}

const normalizeStationName = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizeDayName = (value) => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";

  const shortMap = {
    sun: "sunday",
    mon: "monday",
    tue: "tuesday",
    thu: "thursday",
    wed: "wednesday",
    fri: "friday",
    sat: "saturday",
  };

  const normalized = raw.replace(/[^a-z]/g, "");
  return shortMap[normalized] || normalized;
};

const matchesStation = (storedStation, queryStation) => {
  if (!storedStation || !queryStation) return false;

  const stored = normalizeStationName(storedStation);
  const query = normalizeStationName(queryStation);

  if (!stored || !query) return false;

  return (
    stored === query ||
    stored.includes(query) ||
    query.includes(stored) ||
    stored.startsWith(query) ||
    query.startsWith(stored)
  );
};

const getRouteStationIndex = (route, stationName) => {
  if (!Array.isArray(route) || !route.length) return -1;

  return route.findIndex((station) => {
    if (typeof station === "string") return matchesStation(station, stationName);
    if (station && typeof station === "object") {
      return [station.station, station.name, station.city, station.stop, station.label]
        .some((value) => matchesStation(value, stationName));
    }
    return false;
  });
};

const getDistance = (train, from, to) => {
  const rawDistances = train?.stationDistances || {};
  const stationDistances = Array.isArray(rawDistances)
    ? Object.fromEntries(rawDistances)
    : rawDistances;

  const fromKey = Object.keys(stationDistances).find((key) => matchesStation(key, from));
  const toKey = Object.keys(stationDistances).find((key) => matchesStation(key, to));

  if (!fromKey || !toKey) return 0;

  const fromDist = Number(stationDistances[fromKey]);
  const toDist = Number(stationDistances[toKey]);

  return Number.isFinite(fromDist) && Number.isFinite(toDist) && fromDist < toDist
    ? toDist - fromDist
    : 0;
};

module.exports.TrainBetween = async (req, res) => {
  const { from, to, day, trainType } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const fromClean = from.trim().toLowerCase();
  const toClean = to.trim().toLowerCase();

  try {
    const allTrains = await TrainModel.find({}).lean();
    const trains = Array.isArray(allTrains) ? allTrains : [allTrains].filter(Boolean);

    const validTrains = trains
      .filter((train) => {
        const route = Array.isArray(train?.route) ? train.route : [];
        if (!route.length) return false;

        const fromIndex = getRouteStationIndex(route, fromClean);
        const toIndex = getRouteStationIndex(route, toClean);

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
          return false;
        }

        if (day) {
          const requestedDay = normalizeDayName(day);
          const days = Array.isArray(train?.days)
            ? train.days.map((value) => normalizeDayName(value))
            : [];
          const matchesDay = days.some((value) => value === requestedDay || value === "daily");
          if (!matchesDay) return false;
        }

        if (trainType) {
          const targetType = String(trainType).trim().toLowerCase();
          if (String(train?.trainType || "").trim().toLowerCase() !== targetType) {
            return false;
          }
        }

        return true;
      })
      .map((train) => {
        const route = Array.isArray(train?.route) ? train.route : [];
        const fromIndex = getRouteStationIndex(route, fromClean);
        const toIndex = getRouteStationIndex(route, toClean);

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
          return null;
        }

        const distance = getDistance(train, from, to);

        const updatedCoaches = (train.coaches || []).map((coach) => {
          const safeCoach = coach && coach._doc ? coach._doc : coach;
          const baseFare = Number(safeCoach?.baseFarePerKm ?? safeCoach?.base_fare_per_km ?? 0);
          return {
            ...safeCoach,
            fare: parseFloat((baseFare * distance).toFixed(2)),
          };
        });

        return {
          ...train,
          coaches: updatedCoaches,
          distance,
        };
      })
      .filter(Boolean);

    if (!validTrains.length) {
      return res.status(200).json([]);
    }

    return res.status(200).json(validTrains);
  } catch (error) {
    console.error("TrainBetween error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.bookTrain = async (req, res) => {
  const {
    trainNumber,
    coachType,
    passengerNames,
    from,
    to,
    journeyDate,
    email,
    phone,
    paymentMethod,
  } = req.body;

  // Use the authenticated user's ID from the JWT token
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (
    !trainNumber ||
    !coachType ||
    !passengerNames ||
    !from ||
    !to ||
    !journeyDate
  ) {
    return res.status(400).json({ message: "Missing booking data" });
  }

  let userEmail = email ? email : null;
  let userPhone = phone ? phone : null;

  if ((!email || !phone) && userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!email && user) {
      userEmail = user.email;
    }
    if (!phone && user) {
      userPhone = user.phone;
    }
  }

  const result = PhoneNumberValidator(userPhone);
  if (!result.isValid) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  userPhone = result.formatted;

  const isEmailValid = await validateEmail(userEmail);
  if (!isEmailValid) {
    return res.status(400).json({ message: "Email does not appear to be valid." });
  }

  try {
    const train = await TrainModel.findOne({ trainNumber });
    if (!train) return res.status(404).json({ message: "Train not found" });

    const distance = getDistance(train, from, to);
    const selectedCoach = train.coaches.find(
      (c) => String(c.coachType || "").toLowerCase() === String(coachType).trim().toLowerCase()
    );
    if (!selectedCoach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const fare = Math.round(Number(selectedCoach.baseFarePerKm || 0) * distance) * passengerNames.length;

    const booking = await TrainBookingModel.create({
      user: userId,
      trainNumber,
      trainName: train.trainName,
      coachType,
      seatNumbers: [],
      passengerNames,
      from,
      to,
      journeyDate,
      fare,
      email: userEmail,
      phone: userPhone,
      status: "pending",
      payment: {
        method: paymentMethod || "upi",  // Default to 'upi' if not provided, will be updated with actual method from Razorpay
        provider: "razorpay",
        status: "pending",
        originalMethod: paymentMethod || null,  // Store the originally selected method
      },
    });

    if (!razorpayClient) {
      return res.status(500).json({ message: "Razorpay is not configured on the server." });
    }

    const order = await razorpayClient.orders.create({
      amount: Math.round(fare * 100),
      currency: "INR",
      receipt: `train_booking_${booking._id}`,
      payment_capture: 1,
      notes: {
        trainNumber,
        userId,
        bookingId: booking._id.toString(),
        bookingType: "train",
      },
    });
    booking.payment = { ...(booking.payment || {}), orderId: order.id };
    await booking.save();

    return res.status(201).json({
      message: "Payment required to complete booking",
      data: {
        booking,
        payment: {
          order,
          paymentKeyId: config.razorpay.keyId,
        },
      },
    });
  } catch (err) {
    console.error("Train booking order creation failed:", err);
    return res.status(500).json({ message: "Booking failed" });
  }
};

module.exports.confirmTrainBooking = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification fields are required" });
    }

    const authenticatedUserId = req.user?.userId;
    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const booking = await TrainBookingModel.findById(bookingId);

    if (!booking) {
      console.error(`❌ Train booking not found: bookingId=${bookingId}`);
      return res.status(404).json({ message: "Pending train booking not found" });
    }

    const bookingUserId = String(booking.user || "").trim();
    const requestUserId = String(authenticatedUserId || "").trim();

    console.log(`🔍 Train booking confirmation - bookingUserId: ${bookingUserId}, requestUserId: ${requestUserId}`);

    if (bookingUserId !== requestUserId) {
      console.error(`❌ User mismatch: booking belongs to ${bookingUserId}, but request is from ${requestUserId}`);
      return res.status(403).json({ message: "You are not authorized to confirm this booking" });
    }

    const isValidSignature = verifyRazorpaySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      booking.payment = {
        ...(booking.payment || {}),
        provider: "razorpay",
        status: "failed",
        reference: razorpay_payment_id,
      };
      booking.status = "failed";
      await booking.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const confirmedBooking = await confirmExistingBooking({
      bookingId,
      bookingType: "train",
      payment: { id: razorpay_payment_id },
      orderId: razorpay_order_id,
    });
    return res.status(200).json({
      message: confirmedBooking.status === "booked" ? "Booking successful" : `Added to ${confirmedBooking.status}`,
      booking: confirmedBooking,
    });

    const train = await TrainModel.findOne({ trainNumber: booking.trainNumber });
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const selectedCoach = train.coaches.find(
      (coach) => String(coach.coachType || "").toLowerCase() === String(booking.coachType || "").trim().toLowerCase()
    );

    if (!selectedCoach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const availableSeats = selectedCoach.seats.filter((s) => !s.isBooked && (!s.status || s.status === "Available"));

    let seatToBook = [];
    let finalStatus = "booked";

    if (availableSeats.length < booking.passengerNames.length) {
      const canUseRac = (selectedCoach.racCount || 0) + booking.passengerNames.length <= (selectedCoach.racCapacity || 0);
      const canUseWaitingList = (selectedCoach.waitingListCount || 0) + booking.passengerNames.length <= (selectedCoach.waitingListCapacity || 0);

      if (!canUseRac && !canUseWaitingList) {
        return res.status(409).json({ message: "No confirmed, RAC, or waiting-list capacity is available" });
      }

      finalStatus = canUseRac ? "rac" : "waiting";
      if (finalStatus === "rac") {
        selectedCoach.racCount = (selectedCoach.racCount || 0) + booking.passengerNames.length;
      } else {
        selectedCoach.waitingListCount = (selectedCoach.waitingListCount || 0) + booking.passengerNames.length;
      }
    } else {
      seatToBook = pickRandomSeats(availableSeats, booking.passengerNames.length);

      seatToBook.forEach((seat, index) => {
        const seatInTrain = selectedCoach.seats.find((currentSeat) => Number(currentSeat.seatNumber) === Number(seat.seatNumber));
        if (seatInTrain) {
          seatInTrain.isBooked = true;
          seatInTrain.status = "Booked";
          seatInTrain.passengerName = booking.passengerNames[index];
          seatInTrain.bookingTime = new Date();
        }
      });

      selectedCoach.availableSeats = Math.max(0, (selectedCoach.availableSeats || 0) - booking.passengerNames.length);
    }

    let razorpayPaymentData = null;
    if (razorpayClient) {
      try {
        razorpayPaymentData = await razorpayClient.payments.fetch(razorpay_payment_id);
      } catch (error) {
        console.warn("Unable to fetch Razorpay payment details:", error?.message || error);
      }
    }

    // Use actual method from Razorpay, fall back to originally selected method, then 'upi'
    const paymentMethod = razorpayPaymentData?.method || booking.payment?.originalMethod || booking.payment?.method || "upi";
    const paymentStatus = razorpayPaymentData?.status || "success";
    const paymentAmount = razorpayPaymentData?.amount ? Number(razorpayPaymentData.amount) / 100 : Number(booking.fare || 0);

    booking.status = finalStatus;
    // Ensure seats are properly assigned
    booking.seatNumbers = seatToBook && seatToBook.length > 0
      ? seatToBook.map((seat) => seat.seatNumber)
      : [];
    booking.payment = {
      ...(booking.payment || {}),
      provider: "razorpay",
      method: paymentMethod,
      status: paymentStatus === "captured" || paymentStatus === "authorized" || paymentStatus === "paid" ? "success" : paymentStatus,
      reference: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentAmount,
      currency: razorpayPaymentData?.currency || "INR",
      email: razorpayPaymentData?.email || booking.email,
      contact: razorpayPaymentData?.contact || booking.phone,
      captured: Boolean(razorpayPaymentData?.captured),
      cardType: razorpayPaymentData?.card?.type || null,
      bank: razorpayPaymentData?.bank || null,
      wallet: razorpayPaymentData?.wallet || null,
      createdAt: razorpayPaymentData?.created ? new Date(razorpayPaymentData.created * 1000) : new Date(),
    };

    await train.save();
    await booking.save();

    try {
      await sendNotification(booking.user, {
        type: "booking_confirmed",
        title: "Train Booked",
        message: `Your train booking for ${booking.journeyDate} is ${finalStatus === "booked" ? "confirmed" : finalStatus}`,
        meta: { bookingId: booking._id, trainNumber: booking.trainNumber },
      });
    } catch (notificationError) {
      console.error("Train booking notification failed:", notificationError?.message || notificationError);
    }

    return res.status(201).json({
      message: finalStatus === "booked" ? "Booking successful" : finalStatus === "rac" ? "Added to RAC" : "Added to waiting list",
      booking,
    });
  } catch (error) {
    console.error("Train booking confirmation failed:", error);
    return res.status(500).json({ message: "Booking confirmation failed" });
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
    }).lean();

    if (!bookings || !bookings.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Failed to retrieve train bookings:", err);
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
};

module.exports.generateReceiptPdf = async (req, res) => {
  try {
    const bookingId = req.query.bookingId;

    if (!bookingId) {
      return res.status(400).json({ message: "Please provide booking ID" });
    }

    const booking = await TrainBookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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
      status: booking.status,
      payment: {
        status: booking.payment?.status || "pending",
        method: booking.payment?.method || booking.payment?.originalMethod || "upi",
      },
      passengers: booking.passengerNames.map((name, index) => ({
        name,
        seat: booking.seatNumbers && booking.seatNumbers[index] ? booking.seatNumbers[index] : "N/A",
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
      <div class="title">${ticketData.trainName} (${ticketData.trainNumber
      })</div>
      <div class="info"><strong>Route:</strong> ${ticketData.from} ➝ ${ticketData.to
      }</div>
      <div class="info"><strong>Date:</strong> ${ticketData.date}</div>
      <div class="info"><strong>Coach:</strong> ${ticketData.coach}</div>
      <div class="info"><strong>Fare:</strong> ₹${ticketData.fare}</div>
      <div class="info"><strong>Phone:</strong> ${ticketData.phone}</div>
      <div class="info"><strong>Email:</strong> ${ticketData.email}</div>
      <div class="info"><strong>Status:</strong> ${ticketData.status}</div>
      <div class="info"><strong>Payment Status:</strong> ${ticketData.payment.status || "pending"}</div>
      <div class="info"><strong>Payment Method:</strong> ${ticketData.payment.method || "upi"}</div>
      ${ticketData.payment.reference ? `<div class="info"><strong>Payment Ref:</strong> ${ticketData.payment.reference}</div>` : ""}
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
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      width: "5in",
      height: "4in",
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
    console.error("error is: ", err);
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
      return res.status(404).json({ message: "Booking not found" });
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
      status: booking.status,
      payment: {
        status: booking.payment?.status || "pending",
        method: booking.payment?.method || booking.payment?.originalMethod || "upi",
      },
      passengers: booking.passengerNames.map((name, i) => ({
        name,
        seat: booking.seatNumbers && booking.seatNumbers[i] ? booking.seatNumbers[i] : "N/A",
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
          <p><strong>${ticketData.trainName} (${ticketData.trainNumber
      })</strong></p>
          <p><strong>From:</strong> ${ticketData.from}</p>
          <p><strong>To:</strong> ${ticketData.to}</p>
          <p><strong>Date:</strong> ${ticketData.date}</p>
          <p><strong>Coach:</strong> ${ticketData.coach}</p>
          <p><strong>Fare:</strong> ₹${ticketData.fare}</p>
          <p><strong>Phone:</strong> ${ticketData.phone}</p>
          <p><strong>Email:</strong> ${ticketData.email}</p>
          <p><strong>Status:</strong> ${ticketData.status}</p>
          <p><strong>Payment Status:</strong> ${ticketData.payment.status || "pending"}</p>
          <p><strong>Payment Method:</strong> ${ticketData.payment.method || "upi"}</p>
          ${ticketData.payment.reference ? `<p><strong>Payment Ref:</strong> ${ticketData.payment.reference}</p>` : ""}
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
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      width: "5in",
      height: "4in",
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

module.exports.cancelTrainTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await TrainBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const train = await TrainModel.findOne({
      trainNumber: booking.trainNumber,
    });
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Find coach
    const coach = train.coaches.find((c) => c.coachType === booking.coachType);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found in train" });
    }

    // Un-mark the booked seats
    booking.seatNumbers.forEach((seatNum, index) => {
      const seat = coach.seats.find((s) => s.seatNumber === seatNum);
      if (seat) {
        seat.isBooked = false;
        seat.status = "Available";
        seat.passengerName = null;
        seat.bookingTime = null;
      }
    });

    // Update available Seats
    if (booking.status === "rac") coach.racCount = Math.max(0, (coach.racCount || 0) - booking.passengerNames.length);
    else if (booking.status === "waiting") coach.waitingListCount = Math.max(0, (coach.waitingListCount || 0) - booking.passengerNames.length);
    else coach.availableSeats += booking.seatNumbers.length;

    await train.save();

    booking.status = "cancelled";
    await booking.save();

    try {
      await sendNotification(booking.user, { type: 'booking_cancelled', title: 'Train Booking Cancelled', message: `Your train booking for ${booking.journeyDate?.toString?.() || ''} has been cancelled`, meta: { bookingId: booking._id, trainNumber: booking.trainNumber } });
    } catch (err) {
      console.error('notify error', err.message);
    }

    return res
      .status(200)
      .json({ message: "Train booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel train ticket error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
