const BusModel = require("../models/BusModel");

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
      return res.status(208).json({ message: "No Bus Found" });
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
        console.log("Route:", bus.route);
        console.log("SourceIndex:", sourceIndex, "DestIndex:", destIndex);
        console.log("SourceData:", sourceData);
        console.log("DestData:", destData);

        return {
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
          duration: bus.duration,
        };
      })
      .filter(Boolean);

    if (!filtered.length) {
      return res.status(208).json({ message: "No Bus Found" });
    }

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Bus search error:", error);
    res.status(500).json({ message: "Error fetching buses" });
  }
};
