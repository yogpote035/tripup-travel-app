const BusModel = require("../../models/BusModel");
const BusBookingModel = require("../../models/BusBookingModel");
const { sendNotification } = require("../../utils/socket");
const TYPES = ["Sleeper", "Semi Sleeper", "Seater", "Luxury", "AC"];
const SEAT_STATES = ["Available", "Blocked", "Booked", "Reserved"];
const pageOf = (query) => ({ page: Math.max(1, Number(query.page) || 1), limit: Math.min(100, Math.max(1, Number(query.limit) || 10)) });
const esc = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function normalise(payload) {
    const raw = payload || {};
    const routeInput = Array.isArray(raw.route) ? raw.route : typeof raw.route === "string" ? raw.route.split(",") : Array.isArray(raw.routeText) ? raw.routeText : typeof raw.routeText === "string" ? raw.routeText.split(",") : [];
    const route = routeInput.map((item) => String(item).trim()).filter(Boolean);
    const required = ["busNumber", "company", "departureTime", "arrivalTime"];
    const missing = required.find((key) => !String(raw[key] || "").trim());
    if (missing) throw new Error(`${missing} is required`);
    if (route.length < 2) throw new Error("At least two stops are required");
    const seen = new Set();
    const seats = (raw.seats || []).map((seat, index) => {
        const seatNumber = Number(seat?.seatNumber);
        if (!Number.isInteger(seatNumber) || seen.has(seatNumber)) throw new Error("Seats must have unique numbers");
        seen.add(seatNumber);
        const status = SEAT_STATES.includes(seat?.status) ? seat.status : seat?.isBooked ? "Booked" : "Available";
        return { seatNumber, seatType: seat?.seatType || "Seater", status, position: Number.isInteger(seat?.position) ? seat.position : index, isBooked: status === "Booked", passengerName: status === "Booked" ? seat?.passengerName || null : null, bookingTime: status === "Booked" ? seat?.bookingTime || new Date() : null };
    });
    const stationMap = raw.stationMap || Object.fromEntries(route.map((stop, index) => [stop, { distance: index * 50, duration: `${index}h` }]));
    const durationHours = Number(raw.durationHours ?? 0);
    const durationMinutes = Number(raw.durationMinutes ?? 0);
    const duration = String(raw.duration || "").trim() || `${Math.max(0, durationHours)}h ${Math.max(0, durationMinutes)}m`.trim();
    const driverLocation = raw.driverLocation && (raw.driverLocation.latitude !== undefined || raw.driverLocation.longitude !== undefined)
        ? { latitude: Number(raw.driverLocation.latitude || 0), longitude: Number(raw.driverLocation.longitude || 0), updatedAt: new Date() }
        : undefined;
    return {
        busNumber: String(raw.busNumber).trim().toUpperCase(),
        company: String(raw.company).trim(),
        operator: String(raw.operator || raw.company).trim(),
        route,
        stationMap,
        baseFarePerKm: Math.max(0, Number(raw.baseFarePerKm) || 0),
        departureTime: String(raw.departureTime).trim(),
        arrivalTime: String(raw.arrivalTime).trim(),
        duration,
        days: Array.isArray(raw.days) && raw.days.length ? raw.days : ["Daily"],
        type: TYPES.includes(raw.type) ? raw.type : "Seater",
        status: ["Active", "Inactive", "Cancelled"].includes(raw.status) ? raw.status : "Active",
        driverLocation,
        totalSeats: seats.length,
        availableSeats: seats.filter((seat) => seat.status === "Available").length,
        seats,
    };
}
exports.list = async (req, res) => { try { const { page, limit } = pageOf(req.query); const filter = {}; if (req.query.search) { const term = new RegExp(esc(req.query.search), "i"); filter.$or = [{ busNumber: term }, { company: term }, { operator: term }, { route: term }]; } if (["Active", "Inactive", "Cancelled"].includes(req.query.status)) filter.status = req.query.status; const [items, total] = await Promise.all([BusModel.find(filter).sort({ createdAt: req.query.order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(), BusModel.countDocuments(filter)]); return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } }); } catch { return res.status(500).json({ message: "Unable to load buses" }); } };
exports.create = async (req, res) => { try { const bus = await BusModel.create(normalise(req.body)); return res.status(201).json({ data: bus }); } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Bus number already exists" : error.message }); } };
exports.update = async (req, res) => { try { const bus = await BusModel.findById(req.params.id); if (!bus) return res.status(404).json({ message: "Bus not found" }); const baseBus = { ...bus, _id: bus._id || bus.id, id: bus.id || bus._id }; const booked = (baseBus.seats || []).filter((seat) => seat.isBooked).map((seat) => seat.seatNumber); const next = normalise({ ...baseBus, ...req.body, seats: req.body.seats || baseBus.seats || [] }); if (booked.some((number) => !next.seats.some((seat) => seat.seatNumber === number && seat.status === "Booked"))) return res.status(400).json({ message: "Booked seats cannot be removed or changed" }); const previousStatus = baseBus.status; const persisted = new BusModel({ ...baseBus, ...next, _id: baseBus._id, id: baseBus.id }); await persisted.save(); if (previousStatus !== persisted.status && persisted.status === 'Cancelled') { const affectedBookings = await BusBookingModel.find({ bus: persisted._id, status: 'booked' }).lean(); await Promise.all(affectedBookings.map((booking) => sendNotification(booking.userId, { type: 'bus_cancelled', title: 'Bus Booking Cancelled', message: `Your bus booking for ${booking.journeyDate?.toISOString?.split('T')[0] || ''} has been cancelled`, meta: { bookingId: booking._id, busId: persisted._id } }))); } return res.json({ data: persisted }); } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Bus number already exists" : error.message }); } };
exports.remove = async (req, res) => { try { const bus = await BusModel.findById(req.params.id); if (!bus) return res.status(404).json({ message: "Bus not found" }); if (await BusBookingModel.exists({ bus: bus._id, status: "booked" })) return res.status(409).json({ message: "Buses with active bookings cannot be deleted" }); await bus.deleteOne(); return res.status(204).send(); } catch { return res.status(400).json({ message: "Invalid bus id" }); } };
