const Booking = require("../../models/BookingLifecycleModel");
const SeatLock = require("../../models/SeatLockModel");
const Flight = require("../../models/FlightModel");
const Train = require("../../models/TrainModel");
const Bus = require("../../models/BusModel");
const Razorpay = require("razorpay");
const { getConfig } = require("../../config/environment");
const crypto = require("crypto");
const resources = { flight: Flight, train: Train, bus: Bus };
const { sendNotification } = require('../../utils/socket');
const { confirmExistingBooking } = require("../../services/payment/UniversalConfirmationService");
const lockMinutes = 10;
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

function normalizeSeatNumber(value) {
  return String(value ?? "").trim().toUpperCase();
}

function cleanSeats(seats) {
  return [...new Set((seats || []).map((seat) => normalizeSeatNumber(seat)).filter(Boolean))];
}
async function releaseSeats(booking) {
  const Model = resources[booking.bookingType];
  if (!Model) return;
  const item = await Model.findById(booking.resource);
  if (!item) return;
  const seatSet = new Set((booking.seatNumbers || []).map(normalizeSeatNumber));
  if (booking.bookingType === "train") {
    item.coaches.forEach((coach) => {
      coach.seats.forEach((seat) => {
        if (seatSet.has(normalizeSeatNumber(seat.seatNumber))) {
          seat.isBooked = false;
          seat.status = "Available";
          seat.passengerName = null;
          seat.bookingTime = null;
          coach.availableSeats += 1;
        }
      });
    });
  } else {
    item.seats.forEach((seat) => {
      if (seatSet.has(normalizeSeatNumber(seat.seatNumber))) {
        seat.isBooked = false;
        seat.status = "Available";
        seat.passengerName = null;
        seat.bookingTime = null;
        item.availableSeats += 1;
      }
    });
  }
  await item.save();
}
async function confirmSeats(booking) {
  const Model = resources[booking.bookingType];
  const item = await Model.findById(booking.resource);
  if (!item) throw new Error("Travel service is no longer available");
  const seatSet = new Set((booking.seatNumbers || []).map(normalizeSeatNumber));
  const apply = (seats, holder) => {
    const selected = seats.filter((seat) => seatSet.has(normalizeSeatNumber(seat.seatNumber)));
    if (selected.length !== seatSet.size || selected.some((seat) => seat.isBooked || (seat.status && seat.status !== "Available"))) {
      throw new Error("One or more seats are no longer available");
    }
    selected.forEach((seat, index) => {
      seat.isBooked = true;
      seat.status = "Booked";
      seat.passengerName = booking.passengers[index]?.name || null;
      seat.bookingTime = new Date();
    });
    holder.availableSeats -= selected.length;
  };
  if (booking.bookingType === "train") {
    const coachCode = booking.route?.coachCode;
    const coach = item.coaches.find((entry) => entry.coachCode === coachCode);
    if (!coach) throw new Error("A coach code is required for train seat confirmation");
    apply(coach.seats, coach);
  } else {
    apply(item.seats, item);
  }
  await item.save();
}
exports.createPending = async (req, res) => {
  const { bookingType, resource, route, passengers, seatNumbers, amount, paymentMethod } = req.body;
  if (!resources[bookingType] || !resource || !Array.isArray(passengers) || !passengers.length || !Number.isFinite(Number(amount)))
    return res.status(400).json({ message: "Invalid booking details" });

  const seats = cleanSeats(seatNumbers);
  const expiresAt = new Date(Date.now() + lockMinutes * 60 * 1000);

  if (!config.razorpay?.keyId || !config.razorpay?.keySecret || !razorpayClient) {
    return res.status(500).json({
      message: "Razorpay is not configured on the server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    });
  }

  try {
    const booking = await Booking.create({
      user: req.user.userId,
      bookingType,
      resource,
      route,
      passengers,
      seatNumbers: seats,
      amount: Number(amount),
      expiresAt,
      status: "pending",
      payment: {
        method: paymentMethod || "other",
        provider: "razorpay",
        status: "pending",
      },
    });

    if (seats.length) {
      await Promise.all(
        seats.map((seatNumber) =>
          SeatLock.create({
            resource,
            bookingType,
            seatNumber,
            booking: booking._id,
            expiresAt,
          })
        )
      );
    }

    let paymentData = { mode: "placeholder", expiresAt };
    try {
      const order = await razorpayClient.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `pending_booking_${booking._id}`,
        payment_capture: 1,
        notes: {
          bookingType,
          bookingId: booking._id.toString(),
          bookingSource: "lifecycle",
        },
      });
      booking.payment = { ...(booking.payment || {}), orderId: order.id };
      await booking.save();
      paymentData = { order, paymentKeyId: config.razorpay.keyId };
    } catch (paymentError) {
      console.error("Razorpay order creation failed", paymentError);
      await Booking.findOne({ _id: booking._id, user: req.user.userId, status: "pending" });
      return res.status(500).json({
        message: "Payment gateway unavailable. Razorpay order creation failed.",
        error: paymentError?.message || "Unknown Razorpay error",
      });
    }

    return res.status(201).json({ data: { booking, payment: paymentData } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "One or more seats are currently reserved" });
    return res.status(400).json({ message: error.message || "Unable to start booking" });
  }
};
exports.confirmPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification fields are required" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.userId, status: "pending" });
    if (!booking) return res.status(404).json({ message: "Pending booking not found" });

    if (booking.expiresAt <= new Date()) {
      booking.status = "expired";
      booking.payment = {
        ...booking.payment,
        status: "failed",
        reference: razorpay_payment_id,
      };
      await booking.save();
      await SeatLock.deleteMany({ booking: booking._id });
      return res.status(410).json({ message: "Booking hold has expired" });
    }

    const expectedSignature = verifyRazorpaySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!expectedSignature) {
      booking.status = "failed";
      booking.payment = {
        ...booking.payment,
        status: "failed",
        reference: razorpay_payment_id,
      };
      await booking.save();
      await SeatLock.deleteMany({ booking: booking._id });
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const confirmedBooking = await confirmExistingBooking({
      bookingId: booking._id,
      bookingType: booking.bookingType,
      bookingSource: "lifecycle",
      payment: { id: razorpay_payment_id },
      orderId: razorpay_order_id,
    });
    return res.json({ data: confirmedBooking });

    try {
      await confirmSeats(booking);
    } catch (error) {
      booking.status = "failed";
      booking.payment = {
        ...booking.payment,
        status: "failed",
        reference: razorpay_payment_id,
      };
      await booking.save();
      await SeatLock.deleteMany({ booking: booking._id });
      return res.status(409).json({ message: error.message });
    }

    booking.status = "confirmed";
    booking.payment = {
      ...booking.payment,
      status: "success",
      reference: razorpay_payment_id,
    };
    booking.paymentReference = `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    booking.ticketNumber = `TUP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    booking.qrCodePayload = `TRIPUP|${booking.ticketNumber}|${booking._id}|${booking.amount}`;
    await booking.save();
    await SeatLock.deleteMany({ booking: booking._id });

    try {
      await sendNotification(booking.user, {
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking ${booking.ticketNumber || booking._id} is confirmed`,
        meta: { bookingId: booking._id },
      });
    } catch (e) {
      console.error("notify error", e.message);
    }

    return res.json({ data: booking });
  } catch (err) {
    console.error("confirmPayment error", err);
    return res.status(500).json({ message: "Failed to confirm booking" });
  }
};
exports.history = async (req, res) => { const status = req.query.status; const filter = { user: req.user.userId, ...(status ? { status } : {}) }; const items = await Booking.find(filter).sort({ createdAt: -1 }).lean(); return res.json({ data: items }); };
exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.userId });
    if (!booking || !['pending', 'confirmed'].includes(booking.status)) return res.status(400).json({ message: 'This booking cannot be cancelled' });
    const wasConfirmed = booking.status === 'confirmed';
    booking.status = wasConfirmed ? 'cancelled' : 'expired';
    booking.cancellationReason = req.body.reason || 'Cancelled by traveller';
    booking.refund = wasConfirmed ? { status: 'pending', amount: booking.amount, reference: `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } : { status: 'not_applicable', amount: 0 };
    await booking.save();
    await SeatLock.deleteMany({ booking: booking._id });
    if (wasConfirmed) await releaseSeats(booking);

    try { await sendNotification(booking.user, { type: 'booking_cancelled', title: 'Booking Cancelled', message: `Your booking ${booking.ticketNumber || booking._id} was cancelled`, meta: { bookingId: booking._id } }); } catch (e) { console.error('notify error', e.message); }

    return res.json({ data: booking });
  } catch (err) {
    console.error('cancel error', err);
    return res.status(500).json({ message: 'Failed to cancel booking' });
  }
};
exports.invoice = async (req, res) => { const booking = await Booking.findOne({ _id: req.params.id, user: req.user.userId }).lean(); if (!booking) return res.status(404).json({ message: "Booking not found" }); return res.json({ data: { invoiceNumber: `INV-${booking.ticketNumber || booking._id}`, booking, issuedAt: new Date() } }); };
