const TrainModel = require("../../models/TrainModel");
const TrainBookingModel = require("../../models/TrainBookingModel");
const { sendNotification } = require("../../utils/socket");
const TYPES = ["General", "Sleeper", "3AC", "2AC", "1AC", "Chair Car"];
const STATES = ["Available", "Blocked", "Booked", "Reserved"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const pageOf = (query) => ({ page: Math.max(1, Number(query.page) || 1), limit: Math.min(100, Math.max(1, Number(query.limit) || 10)) });
const esc = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function seatsFromCoach(coach) { const seen = new Set(); return (coach.seats || []).map((seat) => { const seatNumber = Number(seat.seatNumber); if (!Number.isInteger(seatNumber) || seen.has(seatNumber)) throw new Error("Coach seats must have unique numeric seat numbers"); seen.add(seatNumber); const status = STATES.includes(seat.status) ? seat.status : seat.isBooked ? "Booked" : "Available"; return { seatNumber, seatType: seat.seatType || "Aisle", seatClass: TYPES.includes(seat.seatClass) ? seat.seatClass : coach.coachType, status, isBooked: status === "Booked", passengerName: status === "Booked" ? seat.passengerName || null : null, bookingTime: status === "Booked" ? seat.bookingTime || new Date() : null }; }); }
function normalise(payload) { const required = ["trainNumber", "trainName", "journeyTime"]; const missing = required.find((key) => !String(payload[key] || "").trim()); if (missing) throw new Error(`${missing} is required`); const route = (payload.route || []).map((station) => String(station).trim()).filter(Boolean); if (route.length < 2) throw new Error("At least two stations are required"); const stationDistances = payload.stationDistances || Object.fromEntries(route.map((station, index) => [station, index * 100])); const coaches = (payload.coaches || []).map((coach, index) => { if (!TYPES.includes(coach.coachType)) throw new Error("Invalid coach type"); const seats = seatsFromCoach(coach); return { coachType: coach.coachType, coachCode: String(coach.coachCode || `${coach.coachType.slice(0, 2).toUpperCase()}${index + 1}`).trim(), capacity: seats.length, availableSeats: seats.filter((seat) => seat.status === "Available").length, baseFarePerKm: Math.max(0, Number(coach.baseFarePerKm) || 0), waitingListCapacity: Math.max(0, Number(coach.waitingListCapacity) || 0), racCapacity: Math.max(0, Number(coach.racCapacity) || 0), waitingListCount: Math.max(0, Number(coach.waitingListCount) || 0), racCount: Math.max(0, Number(coach.racCount) || 0), seats }; }); return { trainNumber: String(payload.trainNumber).trim().toUpperCase(), trainName: String(payload.trainName).trim(), trainType: String(payload.trainType || "Express").trim(), journeyTime: String(payload.journeyTime).trim(), status: ["Active", "Inactive", "Cancelled"].includes(payload.status) ? payload.status : "Active", route, stationDistances, departure: payload.departure || { station: route[0], time: "00:00" }, arrival: payload.arrival || { station: route.at(-1), time: "00:00" }, days: (payload.days || DAYS).filter((day) => DAYS.includes(day)), coaches }; }
exports.list = async (req, res) => { try { const { page, limit } = pageOf(req.query); const filter = {}; if (req.query.search) { const term = new RegExp(esc(req.query.search), "i"); filter.$or = [{ trainNumber: term }, { trainName: term }, { route: term }]; } if (["Active", "Inactive", "Cancelled"].includes(req.query.status)) filter.status = req.query.status; const [items, total] = await Promise.all([TrainModel.find(filter).sort({ createdAt: req.query.order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(), TrainModel.countDocuments(filter)]); return res.json({ data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } }); } catch { return res.status(500).json({ message: "Unable to load trains" }); } };
exports.create = async (req, res) => { try { const train = await TrainModel.create(normalise(req.body)); return res.status(201).json({ data: train }); } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Train number already exists" : error.message }); } };
exports.update = async (req, res) => {
  try {
    const train = await TrainModel.findById(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });

    const baseTrain = { ...train, _id: train._id || train.id, id: train.id || train._id };
    const trainCoaches = Array.isArray(baseTrain.coaches) ? baseTrain.coaches : [];
    const booked = new Set(
      trainCoaches.flatMap((coach) => {
        const seats = Array.isArray(coach?.seats) ? coach.seats : [];
        return seats
          .filter((seat) => seat && seat.isBooked)
          .map((seat) => `${coach?.coachCode || "coach"}:${seat.seatNumber}`);
      })
    );

    const next = normalise({ ...baseTrain, ...req.body, coaches: req.body.coaches || trainCoaches });
    const nextCoaches = Array.isArray(next.coaches) ? next.coaches : [];
    const removedBookedSeat = [...booked].some((key) => {
      const [coachCode, number] = String(key).split(":");
      return !nextCoaches.some((coach) => {
        const coachSeats = Array.isArray(coach?.seats) ? coach.seats : [];
        return String(coach?.coachCode || "") === String(coachCode) && coachSeats.some((seat) => String(seat?.seatNumber) === String(number) && seat?.status === "Booked");
      });
    });

    if (removedBookedSeat) {
      console.log("Train update blocked: booked seats cannot be removed or changed", {
        trainId: req.params.id,
        bookedSeats: [...booked],
        nextCoaches: nextCoaches.map((coach) => ({ coachCode: coach.coachCode, seats: Array.isArray(coach.seats) ? coach.seats.map((seat) => ({ seatNumber: seat?.seatNumber, status: seat?.status, isBooked: seat?.isBooked })) : [] })),
      });
      return res.status(400).json({ message: "Booked seats cannot be removed or changed" });
    }

    const previousStatus = baseTrain.status;
    const persisted = new TrainModel({ ...baseTrain, ...next, _id: baseTrain._id, id: baseTrain.id });
    await persisted.save();

    if (previousStatus !== persisted.status && persisted.status === 'Cancelled') {
      const affectedBookings = await TrainBookingModel.find({ trainNumber: persisted.trainNumber, status: 'booked' }).lean();
      await Promise.all(affectedBookings.map((booking) => sendNotification(booking.user, { type: 'train_cancelled', title: 'Train Booking Cancelled', message: `Your train booking for ${booking.journeyDate?.toISOString?.split('T')[0] || ''} has been cancelled`, meta: { bookingId: booking._id, trainNumber: persisted.trainNumber } })));
    }
    return res.json({ data: persisted });
  } catch (error) {
    console.log("Train update error:", {
      trainId: req.params.id,
      error: error?.message || error,
      stack: error?.stack,
    });
    return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Train number already exists" : error.message });
  }
};
exports.remove = async (req, res) => { try { const train = await TrainModel.findById(req.params.id); if (!train) return res.status(404).json({ message: "Train not found" }); if (await TrainBookingModel.exists({ trainNumber: train.trainNumber, status: "booked" })) return res.status(409).json({ message: "Trains with active bookings cannot be deleted" }); await train.deleteOne(); return res.status(204).send(); } catch { return res.status(400).json({ message: "Invalid train id" }); } };
