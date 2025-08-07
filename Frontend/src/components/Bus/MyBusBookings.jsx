import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserBusBookings,
  downloadBusTicket,
  mailBusTicketPdf,
} from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";
import Loading from "../../General/Loading";
import { HiDownload, HiOutlineMail } from "react-icons/hi";

const MyBusBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");

  const { booking, loading, error } = useSelector(
    (state) => state.BookBusTicket
  );

  useEffect(() => {
    dispatch(getUserBusBookings());
  }, [dispatch]);

  if (loading) {
    return <Loading message={actionMsg || "Fetching Your Bus Bookings..."} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 mt-10 mb-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-400 mb-6">
          🚌 My Bus Bookings
        </h2>

        {error && <p className="text-red-400">{error}</p>}
        {!loading && booking?.length === 0 && (
          <p className="text-gray-400">You have no bus bookings.</p>
        )}

        <div className="space-y-4">
          {booking?.map((b) => (
            <div
              key={b._id}
              className="bg-gray-800 border border-gray-700 p-4 rounded shadow flex justify-between"
            >
              {/* Left Section: Booking Details */}
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold">
                  🚌 {b.bus?.busNumber}
                </h3>
                <p className="text-sm text-gray-400">
                  {b.source} ➝ {b.destination}
                </p>
                <p className="text-sm text-gray-400">
                  Journey: {new Date(b.journeyDate).toDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Booked on: {new Date(b.bookingDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Total Fare: ₹{b.totalFare.toLocaleString()} (
                  ₹{b.farePerSeat}/seat)
                </p>
                <p className="text-sm text-gray-400">
                  Seats: {b.passengers.length}
                </p>

                <div className="mt-2 text-sm text-gray-300">
                  <p className="font-semibold">Passengers:</p>
                  <ul className="ml-4 list-disc">
                    {b.passengers.map((p, idx) => (
                      <li key={idx}>
                        {p.name} ({p.gender}) - Seat {p.seatNumber}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Section: Actions */}
              <div className="flex flex-col justify-start gap-2">
                <button
                  onClick={() => {
                    dispatch(downloadBusTicket(b._id));
                    setActionMsg("Wait, Your Ticket is Getting Ready...");
                  }}
                  className="flex items-center gap-2 bg-gray-300 text-black text-sm px-3 py-1 rounded hover:bg-gray-400"
                >
                  <HiDownload className="text-lg" /> Download
                </button>
                <button
                  onClick={() => {
                    dispatch(mailBusTicketPdf(b._id));
                    setActionMsg("Wait, You’ll get your ticket by email shortly...");
                  }}
                  className="flex items-center gap-2 bg-amber-50 text-black text-sm px-3 py-1 rounded hover:bg-amber-100"
                >
                  <HiOutlineMail className="text-lg" /> Mail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBusBookings;
