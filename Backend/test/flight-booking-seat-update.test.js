const assert = require("node:assert/strict");
const test = require("node:test");
const { __test__ } = require("../controllers/FlightController/FlightController");

test("flight booking marks SQL plain-object seats as booked", () => {
    const seats = __test__.markSeatsBooked(
        [{ seatNumber: "1A", status: "Available", isBooked: false }, { seatNumber: "1B", status: "Available", isBooked: false }],
        ["1A"],
        [{ seatNumber: "1A", name: "Ava" }]
    );

    assert.equal(seats[0].status, "Booked");
    assert.equal(seats[0].isBooked, true);
    assert.equal(seats[0].passengerName, "Ava");
    assert.equal(seats[1].status, "Available");
});

test("flight booking accepts lowercase seat numbers as the same seats", () => {
    const seats = __test__.markSeatsBooked(
        [{ seatNumber: "1A", status: "Available", isBooked: false }, { seatNumber: "1B", status: "Available", isBooked: false }],
        ["1a"],
        [{ seatNumber: "1a", name: "Ava" }]
    );

    assert.equal(seats[0].status, "Booked");
    assert.equal(seats[0].isBooked, true);
    assert.equal(seats[0].passengerName, "Ava");
    assert.equal(seats[1].status, "Available");
});
