const TrainBooking = require("../../models/TrainBookingModel");
const BusBooking = require("../../models/BusBookingModel");
const FlightBooking = require("../../models/FlightBookingModel");
const HotelBooking = require("../../models/HotelBookingModel");
const LifecycleBooking = require("../../models/BookingLifecycleModel");
const Train = require("../../models/TrainModel");
const Hotel = require("../../models/HotelModel");
const Bus = require("../../models/BusModel");
const Flight = require("../../models/FlightModel");
const SeatLock = require("../../models/SeatLockModel");
const { query } = require("../../database/connection");
const { sendNotification } = require("../../utils/socket");
const { getCapturedPayment, assertAmount, paymentRecord } = require("./RazorpayPaymentService");
const transactional = require("./TransactionalConfirmationService");

// Serializes duplicate frontend/webhook deliveries inside one server process. The
// persisted success payment record remains the cross-request idempotency guard.
const inFlight = new Map();
const withBookingLock = (key, work) => {
  const previous = inFlight.get(key) || Promise.resolve();
  const current = previous.catch(() => undefined).then(work);
  const tracked = current.finally(() => {
    if (inFlight.get(key) === tracked) inFlight.delete(key);
  });
  inFlight.set(key, tracked);
  return tracked;
};

const modelFor = { train: TrainBooking, bus: BusBooking, flight: FlightBooking, hotel: HotelBooking };
const tableFor = {
  train: "train_bookings",
  bus: "bus_bookings",
  flight: "flight_bookings",
  hotel: "hotel_bookings",
  lifecycle: "booking_lifecycles",
};
const amountFor = (booking) => Number(booking.fare ?? booking.totalFare ?? booking.amount ?? 0);
const userFor = (booking) => booking.user || booking.userId;
const alreadyConfirmed = (booking) => booking?.payment?.status === "success" && booking?.payment?.reference;

async function claimConfirmation(table, bookingId) {
  const claimedAt = Date.now();
  const reclaimBefore = claimedAt - 10 * 60 * 1000;
  const result = await query(
    `UPDATE ${table}
       SET status = 'confirming',
           payment = JSON_SET(COALESCE(payment, JSON_OBJECT()), '$.status', 'processing', '$.confirmationStartedAt', ?)
     WHERE id = ?
       AND JSON_UNQUOTE(JSON_EXTRACT(COALESCE(payment, JSON_OBJECT()), '$.status')) <> 'success'
       AND (status = 'pending' OR (status = 'confirming' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(payment, '$.confirmationStartedAt')) AS UNSIGNED) < ?))`,
    [claimedAt, bookingId, reclaimBefore]
  );
  return { claimed: result.affectedRows === 1, claimedAt };
}

async function releaseConfirmationClaim(table, bookingId, claimedAt) {
  await query(
    `UPDATE ${table}
       SET status = 'pending',
           payment = JSON_SET(COALESCE(payment, JSON_OBJECT()), '$.status', 'pending')
     WHERE id = ? AND status = 'confirming'
       AND JSON_UNQUOTE(JSON_EXTRACT(payment, '$.confirmationStartedAt')) = ?`,
    [bookingId, String(claimedAt)]
  );
}

async function notifyOnce(booking, type, title, message, meta) {
  if (booking.payment?.notificationSentAt) return;
  await sendNotification(userFor(booking), { type, title, message, meta });
  booking.payment = { ...booking.payment, notificationSentAt: new Date() };
  await booking.save();
}

async function confirmTrain(booking, payment) {
  const train = await Train.findOne({ trainNumber: booking.trainNumber });
  if (!train) throw new Error("Train not found");
  const coach = train.coaches.find((entry) => String(entry.coachType || "").toLowerCase() === String(booking.coachType || "").toLowerCase());
  if (!coach) throw new Error("Coach not found");
  const count = booking.passengerNames.length;
  const available = coach.seats.filter((seat) => !seat.isBooked && (!seat.status || seat.status === "Available"));
  let status = "booked";
  let seats = [];
  if (available.length >= count) {
    seats = available.sort(() => Math.random() - 0.5).slice(0, count);
    seats.forEach((seat, index) => Object.assign(seat, { isBooked: true, status: "Booked", passengerName: booking.passengerNames[index], bookingTime: new Date() }));
    coach.availableSeats = Math.max(0, Number(coach.availableSeats || 0) - count);
  } else if (Number(coach.racCount || 0) + count <= Number(coach.racCapacity || 0)) {
    status = "rac";
    coach.racCount = Number(coach.racCount || 0) + count;
  } else if (Number(coach.waitingListCount || 0) + count <= Number(coach.waitingListCapacity || 0)) {
    status = "waiting";
    coach.waitingListCount = Number(coach.waitingListCount || 0) + count;
  } else {
    throw new Error("No confirmed, RAC, or waiting-list capacity is available");
  }
  booking.status = status;
  booking.seatNumbers = seats.map((seat) => seat.seatNumber);
  booking.payment = { ...booking.payment, ...paymentRecord(payment, booking.payment?.originalMethod) };
  await train.save();
  await booking.save();
  await notifyOnce(booking, "booking_confirmed", "Train Booked", `Your train booking is ${status}`, { bookingId: booking._id, trainNumber: booking.trainNumber });
  return booking;
}

async function confirmHotel(booking, payment) {
  const hotel = await Hotel.findById(booking.hotel);
  if (!hotel) throw new Error("Hotel not found");
  const roomType = hotel.roomTypes?.find((room) => room.type === booking.roomType);
  if (Number(hotel.availableRooms) < Number(booking.rooms) || (roomType && Number(roomType.availableRooms) < Number(booking.rooms))) {
    throw new Error("Not enough rooms available");
  }
  hotel.availableRooms -= booking.rooms;
  if (roomType) roomType.availableRooms -= booking.rooms;
  booking.status = "confirmed";
  booking.payment = { ...booking.payment, ...paymentRecord(payment, booking.payment?.originalMethod) };
  await hotel.save();
  await booking.save();
  await notifyOnce(booking, "booking_confirmed", "Hotel Booked", `Your stay at ${booking.hotelName} is confirmed`, { bookingId: booking._id, hotelId: booking.hotel });
  return booking;
}

async function confirmExistingBooking({ bookingId, bookingType, bookingSource, payment, orderId }) {
  const verifiedPayment = await getCapturedPayment({ paymentId: payment.id, orderId, payment });
  const result = bookingSource === "lifecycle"
    ? await transactional.confirmLifecycle({ bookingId, payment: verifiedPayment, orderId })
    : await transactional.confirmNative({ bookingId, bookingType, payment: verifiedPayment, orderId });

  if (!result.alreadyConfirmed) {
    const labels = {
      train: ["Train Booked", `Your train booking is ${result.status}`],
      bus: ["Bus Booked", "Your bus booking is confirmed"],
      flight: ["Flight Booked", "Your flight booking is confirmed"],
      hotel: ["Hotel Booked", `Your stay at ${result.hotelName || "the hotel"} is confirmed`],
    };
    const [title, message] = labels[result.bookingType] || ["Booking Confirmed", "Your booking is confirmed"];
    try {
      await sendNotification(result.userId, { type: "booking_confirmed", title, message, meta: { bookingId, resourceId: result.resourceId } });
    } catch (error) {
      console.error("Booking notification failed:", error.message);
    }
  }
  const persisted = bookingSource === "lifecycle"
    ? await LifecycleBooking.findById(bookingId)
    : await modelFor[bookingType].findById(bookingId);
  return persisted || result;

  /* Legacy model-based confirmation is retained below for reference while the
     transaction-backed path above owns all live confirmation requests. */
  const Model = modelFor[bookingType];
  if (!Model) throw new Error(`Unsupported booking type: ${bookingType}`);
  return withBookingLock(`${bookingType}:${bookingId}`, async () => {
    const booking = await Model.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (alreadyConfirmed(booking)) return booking;
    const claim = await claimConfirmation(tableFor[bookingType], bookingId);
    if (!claim.claimed) {
      const current = await Model.findById(bookingId);
      if (alreadyConfirmed(current)) return current;
      const error = new Error("Payment confirmation is already in progress");
      error.code = "PAYMENT_CONFIRMATION_IN_PROGRESS";
      throw error;
    }
    try {
      const verifiedPayment = await getCapturedPayment({ paymentId: payment.id, orderId, payment });
      assertAmount(verifiedPayment, amountFor(booking));
      if (booking.payment?.orderId && booking.payment.orderId !== orderId) throw new Error("Razorpay order does not match booking");
      if (bookingType === "train") return confirmTrain(booking, verifiedPayment);
      if (bookingType === "hotel") return confirmHotel(booking, verifiedPayment);
      if (bookingType === "bus") {
        const bus = await Bus.findById(booking.bus);
        if (!bus) throw new Error("Bus not found");
        const requested = new Set((booking.passengers || []).map((passenger) => String(passenger.seatNumber)));
        const selected = bus.seats.filter((seat) => requested.has(String(seat.seatNumber)));
        if (selected.length !== requested.size || selected.some((seat) => seat.isBooked || (seat.status && seat.status !== "Available"))) throw new Error("One or more bus seats are no longer available");
        selected.forEach((seat) => {
          const passenger = booking.passengers.find((entry) => String(entry.seatNumber) === String(seat.seatNumber));
          Object.assign(seat, { isBooked: true, status: "Booked", passengerName: passenger?.name || null, bookingTime: new Date() });
        });
        bus.availableSeats = Math.max(0, Number(bus.availableSeats || 0) - selected.length);
        await bus.save();
      }
      booking.status = "booked";
      booking.payment = { ...booking.payment, ...paymentRecord(verifiedPayment, booking.payment?.originalMethod) };
      await booking.save();
      return booking;
    } catch (error) {
      await releaseConfirmationClaim(tableFor[bookingType], bookingId, claim.claimedAt);
      throw error;
    }
  });
}

async function confirmLifecycle({ bookingId, payment, orderId }) {
  return withBookingLock(`lifecycle:${bookingId}`, async () => {
    const booking = await LifecycleBooking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (alreadyConfirmed(booking)) return booking;
    const claim = await claimConfirmation(tableFor.lifecycle, bookingId);
    if (!claim.claimed) {
      const current = await LifecycleBooking.findById(bookingId);
      if (alreadyConfirmed(current)) return current;
      const error = new Error("Payment confirmation is already in progress");
      error.code = "PAYMENT_CONFIRMATION_IN_PROGRESS";
      throw error;
    }
    try {
      const verifiedPayment = await getCapturedPayment({ paymentId: payment.id, orderId, payment });
      assertAmount(verifiedPayment, booking.amount);
      const Model = { flight: Flight, train: Train, bus: Bus }[booking.bookingType];
      const resource = Model && await Model.findById(booking.resource);
      if (!resource) throw new Error("Travel service is no longer available");
      const seats = new Set((booking.seatNumbers || []).map((seat) => String(seat).trim().toUpperCase()));
      const assign = (items, holder) => {
        const selected = items.filter((seat) => seats.has(String(seat.seatNumber).trim().toUpperCase()));
        if (selected.length !== seats.size || selected.some((seat) => seat.isBooked || (seat.status && seat.status !== "Available"))) {
          throw new Error("One or more seats are no longer available");
        }
        selected.forEach((seat, index) => Object.assign(seat, { isBooked: true, status: "Booked", passengerName: booking.passengers[index]?.name || null, bookingTime: new Date() }));
        holder.availableSeats = Math.max(0, Number(holder.availableSeats || 0) - selected.length);
      };
      if (booking.bookingType === "train") {
        const coach = resource.coaches.find((entry) => entry.coachCode === booking.route?.coachCode);
        if (!coach) throw new Error("A coach code is required for train seat confirmation");
        assign(coach.seats, coach);
      } else assign(resource.seats, resource);
      booking.status = "confirmed";
      booking.payment = { ...booking.payment, ...paymentRecord(verifiedPayment, booking.payment?.originalMethod) };
      await resource.save();
      await booking.save();
      await SeatLock.deleteMany({ booking: booking._id });
      await notifyOnce(booking, "booking_confirmed", "Booking Confirmed", `Your booking ${booking._id} is confirmed`, { bookingId: booking._id });
      return booking;
    } catch (error) {
      await releaseConfirmationClaim(tableFor.lifecycle, bookingId, claim.claimedAt);
      throw error;
    }
  });
}

async function confirmWebhookPayment(args) { return confirmExistingBooking(args); }

async function markWebhookPaymentFailed({ bookingId, bookingType, bookingSource, payment, orderId }) {
  const Model = bookingSource === "lifecycle" ? LifecycleBooking : modelFor[bookingType];
  if (!Model) return;
  const booking = await Model.findById(bookingId);
  if (!booking || alreadyConfirmed(booking)) return;
  if (booking.payment?.orderId && booking.payment.orderId !== orderId) throw new Error("Razorpay order does not match booking");
  booking.payment = { ...booking.payment, provider: "razorpay", status: "failed", reference: payment.id, orderId };
  await booking.save();
}

module.exports = { confirmExistingBooking, confirmWebhookPayment, markWebhookPaymentFailed };
