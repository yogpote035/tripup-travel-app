const assert = require("node:assert/strict");
const test = require("node:test");
const { __test__ } = require("../controllers/AdminController/FlightManagementController");
const FlightModel = require("../models/FlightModel");

test("flight seat normalizer accepts a generated row layout", () => {
    const seats = __test__.normaliseSeats([
        [{ seatNumber: "1A" }, { seatNumber: "1B" }],
        [{ seatNumber: "2A" }, { seatNumber: "2B" }],
    ]);

    assert.deepEqual(seats.map((seat) => seat.seatNumber), ["1A", "1B", "2A", "2B"]);
    assert.equal(seats.every((seat) => seat.status === "Available"), true);
});

test("flight seat normalizer rejects duplicate seats with the seat number", () => {
    assert.throws(() => __test__.normaliseSeats([{ seatNumber: "1A" }, { seatNumber: "1a" }]), /Duplicate seat number: 1A/);
});

test("flight seat normalizer assigns labels to incomplete generated entries", () => {
    const seats = __test__.normaliseSeats([{ status: "Available" }, { status: "Blocked" }]);
    assert.deepEqual(seats.map((seat) => seat.seatNumber), ["1A", "1B"]);
    assert.equal(seats[1].status, "Blocked");
});

test("flight weekday search uses JSON array membership", () => {
    const { conditions, values } = FlightModel.__test__.buildFlightWhereClause({
        from: { $regex: /^pune$/i },
        to: { $regex: /^goa$/i },
        days: "Wednesday",
    });

    assert.match(conditions.join(" AND "), /JSON_CONTAINS\(days, JSON_QUOTE\(\?\)\)/);
    assert.equal(values.at(-1), "Wednesday");
});

test("flight model accepts TiDB JSON values that are already parsed", () => {
    const flight = FlightModel.__test__.normalizeFlightRow({
        id: "flight-id",
        flight_number: "TU100",
        days: ["Wednesday"],
        seats: [{ seatNumber: "1A" }],
    });
    assert.deepEqual(flight.days, ["Wednesday"]);
    assert.deepEqual(flight.seats, [{ seatNumber: "1A" }]);
});
