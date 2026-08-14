const assert = require("node:assert/strict");
const test = require("node:test");
const { mock } = require("node:test");

const connection = require("../database/connection");
mock.method(connection, "query", async () => []);

const NotificationModel = require("../models/NotificationModel");
const FlightBookingModel = require("../models/FlightBookingModel");
const BookingLifecycleModel = require("../models/BookingLifecycleModel");
const { wrapDocument } = require("../models/sqlCompat");

test("notification model supports Mongo-style updateOne for marking notifications read", async () => {
    const result = await NotificationModel.updateOne(
        { _id: "missing-notification-id", user: "missing-user-id" },
        { $set: { read: true } }
    );

    assert.equal(result, null);
});

test("flight booking model accepts already-parsed JSON payloads", () => {
    const booking = new FlightBookingModel({
        _id: "booking-1",
        user: "user-1",
        flight: "flight-1",
        journeyDate: "2026-08-21T10:00:00.000Z",
        bookingDate: "2026-08-20T09:00:00.000Z",
        from: "Delhi",
        to: "Mumbai",
        farePerSeat: 1200,
        totalFare: 2400,
        payment: { status: "paid", method: "UPI" },
        passengers: [{ name: "Ava", age: 28 }],
        status: "booked",
    });

    assert.deepEqual(booking.payment, { status: "paid", method: "UPI" });
    assert.deepEqual(booking.passengers, [{ name: "Ava", age: 28 }]);
});

test("booking lifecycle model converts undefined optional fields to SQL nulls", () => {
    const booking = new BookingLifecycleModel({
        _id: "pending-booking-1",
        user: "user-1",
        bookingType: "flight",
        resource: "flight-1",
        route: { from: "Delhi", to: "Mumbai", journeyDate: "2026-08-21" },
        passengers: [{ name: "Ava", seatNumber: "A1" }],
        seatNumbers: ["A1"],
        amount: 2400,
        payment: { method: "card", provider: "razorpay", status: "pending" },
        status: "pending",
        expiresAt: new Date("2026-08-13T20:00:00.000Z"),
        paymentReference: undefined,
        cancellationReason: undefined,
        refund: undefined,
        ticketNumber: undefined,
        qrCodePayload: undefined,
    });

    assert.equal(booking.paymentReference, null);
    assert.equal(booking.cancellationReason, null);
    assert.equal(booking.ticketNumber, null);
    assert.deepEqual(booking.refund, { status: "not_requested" });
});

test("wrapped booking lifecycle rows expose a save method", async () => {
    const booking = wrapDocument({
        _id: "pending-booking-2",
        id: "pending-booking-2",
        user: "user-1",
        bookingType: "flight",
        resource: "flight-1",
        route: { from: "Delhi", to: "Mumbai", journeyDate: "2026-08-21" },
        passengers: [{ name: "Ava" }],
        seatNumbers: ["A1"],
        amount: 2400,
        payment: { status: "pending" },
        status: "pending",
        expiresAt: new Date("2026-08-13T20:00:00.000Z"),
    }, BookingLifecycleModel);

    assert.equal(typeof booking.save, "function");
    assert.equal(booking.status, "pending");
    await assert.doesNotReject(() => booking.save());
});
