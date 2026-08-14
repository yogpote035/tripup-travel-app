const FlightModel = require("../../models/FlightModel");
const FlightBookingModel = require("../../models/FlightBookingModel");
const { sendNotification } = require("../../utils/socket");

const SEAT_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];
const SEAT_POSITIONS = ["Window", "Middle", "Aisle"];
const SEAT_STATES = ["Available", "Blocked", "Booked", "Reserved"];
const FLIGHT_STATUSES = ["Scheduled", "Delayed", "Cancelled", "Inactive"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const paging = (query) => ({ page: Math.max(1, Number.parseInt(query.page, 10) || 1), limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)) });

function normaliseSeats(seats = []) {
  if (!Array.isArray(seats)) throw new Error("Seats must be an array");
  const flattenedSeats = seats.flat(Infinity);
  const seen = new Set();
  return flattenedSeats.map((seat, index) => {
    if (!seat || typeof seat !== "object" || Array.isArray(seat)) {
      throw new Error(`Seat ${index + 1} must be a valid seat object`);
    }
    // The server remains the source of truth for generated layouts. Older
    // clients may submit seat descriptors without a label, so derive one from
    // the zero-based position using the conventional six-seat cabin layout.
    const generatedSeatNumber = `${Math.floor(index / 6) + 1}${String.fromCharCode(65 + (index % 6))}`;
    const seatNumber = String(seat.seatNumber || seat.number || generatedSeatNumber).trim().toUpperCase();
    if (seen.has(seatNumber)) throw new Error(`Duplicate seat number: ${seatNumber}`);
    seen.add(seatNumber);
    const status = SEAT_STATES.includes(seat.status) ? seat.status : seat.isBooked ? "Booked" : "Available";
    const seatPosition = SEAT_POSITIONS.includes(seat.seatPosition)
      ? seat.seatPosition
      : index % 6 === 0 || index % 6 === 5 ? "Window" : index % 3 === 1 ? "Middle" : "Aisle";
    return { seatNumber, seatClass: SEAT_CLASSES.includes(seat.seatClass) ? seat.seatClass : "Economy", seatPosition, status, isBooked: status === "Booked", passengerName: status === "Booked" ? seat.passengerName || null : null, bookingTime: status === "Booked" ? seat.bookingTime || new Date() : null };
  });
}

function normaliseFlight(payload) {
  const required = ["flightNumber", "airline", "from", "to", "departureTime", "arrivalTime", "duration"];
  const missing = required.find((field) => !String(payload[field] || "").trim());
  if (missing) throw new Error(`${missing} is required`);
  const price = Number(payload.basePrice ?? payload.price);
  if (!Number.isFinite(price) || price < 0) throw new Error("Base price must be a valid non-negative number");
  const seats = normaliseSeats(payload.seats || []);
  const days = Array.isArray(payload.days) && payload.days.length ? payload.days.filter((day) => DAYS.includes(day)) : DAYS;
  return { flightNumber: String(payload.flightNumber).trim().toUpperCase(), airline: String(payload.airline).trim(), aircraft: String(payload.aircraft || "").trim(), from: String(payload.from).trim(), to: String(payload.to).trim(), sourceAirport: String(payload.sourceAirport || payload.from).trim(), destinationAirport: String(payload.destinationAirport || payload.to).trim(), departureTime: String(payload.departureTime).trim(), arrivalTime: String(payload.arrivalTime).trim(), duration: String(payload.duration).trim(), stops: Math.max(0, Number.parseInt(payload.stops, 10) || 0), status: FLIGHT_STATUSES.includes(payload.status) ? payload.status : "Scheduled", price, basePrice: price, days, seats, totalSeats: seats.length, availableSeats: seats.filter((seat) => seat.status === "Available").length };
}

// Exposed for the backend regression test; routes use only the handlers below.
exports.__test__ = { normaliseSeats };

exports.listFlights = async (req, res) => {
  try {
    const { page, limit } = paging(req.query); const filter = {};
    const search = String(req.query.search || "").trim();
    if (search) { const term = new RegExp(escapeRegex(search), "i"); filter.$or = [{ flightNumber: term }, { airline: term }, { from: term }, { to: term }, { sourceAirport: term }, { destinationAirport: term }]; }
    if (FLIGHT_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.airline) filter.airline = new RegExp(`^${escapeRegex(req.query.airline)}$`, "i");
    const sortField = ["flightNumber", "airline", "price", "createdAt"].includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const [items, total] = await Promise.all([FlightModel.find(filter).sort({ [sortField]: req.query.order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(), FlightModel.countDocuments(filter)]);
    return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { return res.status(500).json({ message: "Unable to load flights" }); }
};

exports.getFlight = async (req, res) => { try { const flight = await FlightModel.findById(req.params.id).lean(); return flight ? res.json({ data: flight }) : res.status(404).json({ message: "Flight not found" }); } catch { return res.status(400).json({ message: "Invalid flight id" }); } };

exports.createFlight = async (req, res) => {
  try { const flight = await FlightModel.create(normaliseFlight(req.body)); return res.status(201).json({ data: flight }); }
  catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Flight number already exists" : error.message }); }
};

exports.updateFlight = async (req, res) => {
  try {
    const current = await FlightModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Flight not found" });

    const currentSnapshot = current && typeof current.toObject === "function"
      ? current.toObject()
      : { ...current };

    const bookedSeats = (current.seats || []).filter((seat) => seat.isBooked).map((seat) => seat.seatNumber);
    const requested = normaliseFlight({
      ...currentSnapshot,
      ...req.body,
      seats: Array.isArray(req.body.seats) ? req.body.seats : current.seats || [],
    });

    if (bookedSeats.some((seatNumber) => !requested.seats.some((seat) => seat.seatNumber === seatNumber && seat.status === "Booked"))) return res.status(400).json({ message: "Booked seats cannot be removed or changed" });

    const previousStatus = current.status;
    const nextStatus = requested.status;
    Object.assign(current, requested);
    await current.save();

    if (previousStatus !== nextStatus) {
      const affectedBookings = await FlightBookingModel.find({ flight: current._id, status: 'booked' }).lean();
      const notificationType = nextStatus === 'Delayed' ? 'flight_delayed' : nextStatus === 'Cancelled' ? 'flight_cancelled' : null;
      const notificationTitle = nextStatus === 'Delayed' ? 'Flight Delayed' : nextStatus === 'Cancelled' ? 'Flight Cancelled' : null;
      const notificationMessage = nextStatus === 'Delayed'
        ? `Flight ${current.flightNumber} has been delayed.`
        : nextStatus === 'Cancelled'
          ? `Flight ${current.flightNumber} has been cancelled.`
          : null;

      if (notificationType && notificationMessage) {
        await Promise.all(affectedBookings.map((booking) => sendNotification(booking.user, {
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          meta: { bookingId: booking._id, flightId: current._id },
        })));
      }
    }

    return res.json({ data: current });
  } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Flight number already exists" : error.message }); }
};

exports.deleteFlight = async (req, res) => {
  try { if (await FlightBookingModel.exists({ flight: req.params.id, status: "booked" })) return res.status(409).json({ message: "Flights with active bookings cannot be deleted" }); const flight = await FlightModel.findByIdAndDelete(req.params.id); return flight ? res.status(204).send() : res.status(404).json({ message: "Flight not found" }); } catch { return res.status(400).json({ message: "Invalid flight id" }); }
};

exports.bulkDeleteFlights = async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ message: "At least one flight id is required" });
  const booked = await FlightBookingModel.exists({ flight: { $in: ids }, status: "booked" });
  if (booked) return res.status(409).json({ message: "One or more selected flights have active bookings" });
  const result = await FlightModel.deleteMany({ _id: { $in: ids } }); return res.json({ data: { deletedCount: result.deletedCount } });
};

exports.importFlights = async (req, res) => {
  const rows = Array.isArray(req.body.flights) ? req.body.flights : [];
  if (!rows.length || rows.length > 100) return res.status(400).json({ message: "Provide between 1 and 100 flights" });
  try { const flights = rows.map(normaliseFlight); const result = await FlightModel.insertMany(flights, { ordered: true }); return res.status(201).json({ data: { created: result.length } }); }
  catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "One or more flight numbers already exist" : error.message }); }
};

exports.exportFlights = async (req, res) => {
  const flights = await FlightModel.find({}).sort({ createdAt: -1 }).lean();
  const fields = ["flightNumber", "airline", "aircraft", "from", "to", "sourceAirport", "destinationAirport", "departureTime", "arrivalTime", "duration", "stops", "status", "basePrice", "days"];
  const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [fields.join(","), ...flights.map((flight) => fields.map((field) => quote(Array.isArray(flight[field]) ? flight[field].join("|") : flight[field])).join(","))].join("\n");
  res.set({ "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=tripup-flights.csv" }); return res.send(csv);
};
