const { transaction } = require("../../database/connection");
const { paymentRecord } = require("./RazorpayPaymentService");

const tableFor = { train: "train_bookings", bus: "bus_bookings", flight: "flight_bookings", hotel: "hotel_bookings" };

function json(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  if (Buffer.isBuffer(value)) value = value.toString("utf8");
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

async function one(connection, sql, params) {
  const [rows] = await connection.query(sql, params);
  return rows[0] || null;
}

function alreadyPaid(payment) {
  return payment?.status === "success" && payment?.reference;
}

function assertPayment(payment, storedPayment, amount, orderId) {
  if (storedPayment?.orderId && storedPayment.orderId !== orderId) throw new Error("Razorpay order does not match booking");
  if (payment.order_id !== orderId) throw new Error("Razorpay payment does not match the order");
  if (String(payment.currency).toUpperCase() !== "INR" || payment.status !== "captured" || !payment.captured) throw new Error("Razorpay payment has not been captured");
  if (Number(payment.amount) !== Math.round(Number(amount) * 100)) throw new Error("Razorpay payment amount does not match the booking amount");
}

function updatePayment(current, payment) {
  return { ...current, ...paymentRecord(payment, current?.originalMethod) };
}

async function confirmNative({ bookingId, bookingType, payment, orderId }) {
  const table = tableFor[bookingType];
  if (!table) throw new Error(`Unsupported booking type: ${bookingType}`);
  return transaction(async (connection) => {
    const row = await one(connection, `SELECT * FROM ${table} WHERE id = ? FOR UPDATE`, [bookingId]);
    if (!row) throw new Error("Booking not found");
    const storedPayment = json(row.payment, { status: "pending" });
    if (alreadyPaid(storedPayment)) return { alreadyConfirmed: true, bookingType };

    const amount = Number(row.fare ?? row.total_fare ?? 0);
    assertPayment(payment, storedPayment, amount, orderId);
    const nextPayment = updatePayment(storedPayment, payment);

    if (bookingType === "train") {
      const train = await one(connection, "SELECT * FROM trains WHERE train_number = ? FOR UPDATE", [row.train_number]);
      if (!train) throw new Error("Train not found");
      const coaches = json(train.coaches, []);
      const coach = coaches.find((item) => String(item.coachType || "").toLowerCase() === String(row.coach_type || "").toLowerCase());
      if (!coach) throw new Error("Coach not found");
      const names = json(row.passenger_names, []);
      const available = (coach.seats || []).filter((seat) => !seat.isBooked && (!seat.status || seat.status === "Available"));
      let status = "booked";
      let chosen = [];
      if (available.length >= names.length) {
        chosen = available.sort(() => Math.random() - 0.5).slice(0, names.length);
        chosen.forEach((seat, index) => Object.assign(seat, { isBooked: true, status: "Booked", passengerName: names[index], bookingTime: new Date() }));
        coach.availableSeats = Math.max(0, Number(coach.availableSeats || 0) - names.length);
      } else if (Number(coach.racCount || 0) + names.length <= Number(coach.racCapacity || 0)) {
        status = "rac";
        coach.racCount = Number(coach.racCount || 0) + names.length;
      } else if (Number(coach.waitingListCount || 0) + names.length <= Number(coach.waitingListCapacity || 0)) {
        status = "waiting";
        coach.waitingListCount = Number(coach.waitingListCount || 0) + names.length;
      } else throw new Error("No confirmed, RAC, or waiting-list capacity is available");
      await connection.query("UPDATE trains SET coaches = ? WHERE id = ?", [JSON.stringify(coaches), train.id]);
      await connection.query("UPDATE train_bookings SET status = ?, seat_numbers = ?, payment = ? WHERE id = ?", [status, JSON.stringify(chosen.map((seat) => seat.seatNumber)), JSON.stringify(nextPayment), bookingId]);
      return { bookingType, status, payment: nextPayment, bookingId, userId: row.user_id, trainNumber: row.train_number };
    }

    if (bookingType === "hotel") {
      const hotel = await one(connection, "SELECT * FROM hotels WHERE id = ? FOR UPDATE", [row.hotel_id]);
      if (!hotel) throw new Error("Hotel not found");
      const roomTypes = json(hotel.room_types, []);
      const roomType = roomTypes.find((item) => item.type === row.room_type);
      if (Number(hotel.available_rooms) < Number(row.rooms) || (roomType && Number(roomType.availableRooms) < Number(row.rooms))) throw new Error("Not enough rooms available");
      if (roomType) roomType.availableRooms -= Number(row.rooms);
      await connection.query("UPDATE hotels SET available_rooms = ?, room_types = ? WHERE id = ?", [Number(hotel.available_rooms) - Number(row.rooms), JSON.stringify(roomTypes), hotel.id]);
      await connection.query("UPDATE hotel_bookings SET status = 'confirmed', payment = ? WHERE id = ?", [JSON.stringify(nextPayment), bookingId]);
      return { bookingType, status: "confirmed", payment: nextPayment, bookingId, userId: row.user_id, hotelId: row.hotel_id, hotelName: row.hotel_name };
    }

    const resourceTable = bookingType === "bus" ? "buses" : "flights";
    const resourceId = bookingType === "bus" ? row.bus_id : row.flight_id;
    const resource = await one(connection, `SELECT * FROM ${resourceTable} WHERE id = ? FOR UPDATE`, [resourceId]);
    if (!resource) throw new Error(bookingType === "bus" ? "Bus not found" : "Flight not found");
    const passengers = json(row.passengers, []);
    const selectedNumbers = new Set(passengers.map((person) => String(person.seatNumber).trim().toUpperCase()));
    const seats = json(resource.seats, []);
    const selected = seats.filter((seat) => selectedNumbers.has(String(seat.seatNumber).trim().toUpperCase()));
    if (selected.length !== selectedNumbers.size || selected.some((seat) => seat.isBooked || (seat.status && seat.status !== "Available"))) throw new Error("One or more seats are no longer available");
    selected.forEach((seat) => {
      const passenger = passengers.find((person) => String(person.seatNumber).trim().toUpperCase() === String(seat.seatNumber).trim().toUpperCase());
      Object.assign(seat, { isBooked: true, status: "Booked", passengerName: passenger?.name || null, bookingTime: new Date() });
    });
    await connection.query(`UPDATE ${resourceTable} SET seats = ?, available_seats = ? WHERE id = ?`, [JSON.stringify(seats), Math.max(0, Number(resource.available_seats || 0) - selected.length), resource.id]);
    await connection.query(`UPDATE ${table} SET status = 'booked', payment = ? WHERE id = ?`, [JSON.stringify(nextPayment), bookingId]);
    return { bookingType, status: "booked", payment: nextPayment, bookingId, userId: row.user_id, resourceId };
  });
}

async function confirmLifecycle({ bookingId, payment, orderId }) {
  return transaction(async (connection) => {
    const row = await one(connection, "SELECT * FROM booking_lifecycles WHERE id = ? FOR UPDATE", [bookingId]);
    if (!row) throw new Error("Booking not found");
    const storedPayment = json(row.payment, { status: "pending" });
    if (alreadyPaid(storedPayment)) return { alreadyConfirmed: true, bookingType: row.booking_type };
    assertPayment(payment, storedPayment, Number(row.amount), orderId);
    const bookingType = row.booking_type;
    const resourceTable = bookingType === "train" ? "trains" : bookingType === "bus" ? "buses" : "flights";
    const resource = await one(connection, `SELECT * FROM ${resourceTable} WHERE id = ? FOR UPDATE`, [row.resource_id]);
    if (!resource) throw new Error("Travel service is no longer available");
    const route = json(row.route, {});
    const passengers = json(row.passengers, []);
    const wanted = new Set(json(row.seat_numbers, []).map((seat) => String(seat).trim().toUpperCase()));
    let holder = resource;
    let seats = json(resource.seats, []);
    let coaches = null;
    if (bookingType === "train") {
      coaches = json(resource.coaches, []);
      holder = coaches.find((coach) => coach.coachCode === route.coachCode);
      if (!holder) throw new Error("A coach code is required for train seat confirmation");
      seats = holder.seats || [];
    }
    const selected = seats.filter((seat) => wanted.has(String(seat.seatNumber).trim().toUpperCase()));
    if (selected.length !== wanted.size || selected.some((seat) => seat.isBooked || (seat.status && seat.status !== "Available"))) throw new Error("One or more seats are no longer available");
    selected.forEach((seat, index) => Object.assign(seat, { isBooked: true, status: "Booked", passengerName: passengers[index]?.name || null, bookingTime: new Date() }));
    holder.availableSeats = Math.max(0, Number(holder.availableSeats || 0) - selected.length);
    if (bookingType === "train") await connection.query("UPDATE trains SET coaches = ? WHERE id = ?", [JSON.stringify(coaches), resource.id]);
    else await connection.query(`UPDATE ${resourceTable} SET seats = ?, available_seats = ? WHERE id = ?`, [JSON.stringify(seats), holder.availableSeats, resource.id]);
    const nextPayment = updatePayment(storedPayment, payment);
    await connection.query("UPDATE booking_lifecycles SET status = 'confirmed', payment = ? WHERE id = ?", [JSON.stringify(nextPayment), bookingId]);
    await connection.query("DELETE FROM seat_locks WHERE booking_id = ?", [bookingId]);
    return { bookingType, status: "confirmed", payment: nextPayment, bookingId, userId: row.user_id };
  });
}

module.exports = { confirmNative, confirmLifecycle };
