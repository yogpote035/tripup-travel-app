const mongoose = require("mongoose");
const BusModel = require("../models/BusModel"); // Adjust the path as needed

const updateBusSeats = async () => {
  await mongoose.connect(
    "tyuj7yu"
  );

  const buses = await BusModel.find();

  for (let bus of buses) {
    const seats = bus.seats || [];

    const allSeater = seats.every((s) => s.seatType === "Seater");
    const allSleeper = seats.every((s) => s.seatType === "Sleeper");

    if (allSeater) {
      bus.totalSeats = 40;
      bus.availableSeats = 40;
      bus.seats = seats.slice(0, 40);
    } else {
      // Mixed or all Sleeper → make it Sleeper
      bus.totalSeats = 24;
      bus.availableSeats = 24;
      bus.seats = seats.slice(0, 24);
      bus.type = "Sleeper";
    }

    await bus.save();
    console.log(`Updated bus: ${bus.busNumber}`);
  }

  mongoose.disconnect();
};

updateBusSeats().catch(console.error);
