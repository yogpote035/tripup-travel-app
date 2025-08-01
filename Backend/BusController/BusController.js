const BusModel = require("../models/BusModel");
const BusBookingModel = require("../models/BusBookingModel");

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

  try {
    if (!source || !destination || !date) {
      return res.status(406).json({ message: "Missing required parameters" });
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
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
    console.log("Before Filter Bus");
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
    console.log("After Filter Bus");
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
    passengers.length === 0
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
      journeyDate,
      source,
      destination,
      distance,
      farePerSeat: Math.round(farePerSeat),
      totalFare,
      passengers,
    });

    return res.status(200).json({ message: "Booking successful" });
  } catch (error) {
    console.error("Error during booking:", error);
    return res.status(500).json({ message: "Server error during booking" });
  }
};
