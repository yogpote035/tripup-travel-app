const TrainBookingModel = require("../../models/TrainBookingModel");
const UserModel = require("../../models/UserModel");
const TrainModel = require("../../models/TrainModel");

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
  console.log("TrainBetween API request received");

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
      ...(day && { days: new RegExp(`^${day}$`, "i") }),
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
    console.error("TrainBetween error:", error);
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
    !journeyDate
  ) {
    return res.status(400).json({ message: "Missing booking data" });
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

    // Fallback to user info from UserModel
    let userEmail = email;
    let userPhone = phone;

    if ((!email || !phone) && userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        userEmail = email || user.email;
        userPhone = phone || user.phone;
      }
    }

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
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};
