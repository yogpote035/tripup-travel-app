import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyFlightBookings } from "../../../AllStatesFeatures/Flight/BookFlightSeatSlice";
import {
  downloadFlightTicket,
  mailFlightTicket,
} from "../../../AllStatesFeatures/Flight/AllFlightSlice";
import Loading from "../../General/Loading";
import { HiDownload, HiOutlineMail } from "react-icons/hi";
import { useLocation } from "react-router-dom";

const MyFlightBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    dispatch(fetchMyFlightBookings());
  }, [dispatch]);

  const { pathname } = useLocation();

  window.scrollTo(0, 0); //only once 1st time scroll to top

  const { booking, loading, error } = useSelector(
    (state) => state.BookFlightTicket
  );
  const { loading: loadingAll, error: errorAll } = useSelector(
    (state) => state.flight
  );

  if (loadingAll) return <Loading message={actionMsg} />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 mt-10 mb-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          🛫 My Flight Bookings
        </h2>

        {loading && <Loading message="Fetching Your Flight bookings..." />}
        {(error || errorAll) && (
          <p className="text-red-400">{error || errorAll}</p>
        )}
        {!loading && booking?.length === 0 && (
          <p className="text-gray-400">You have no flight bookings.</p>
        )}

        <div className="space-y-4">
          {booking?.map((booking) => (
            <div
              key={booking._id}
              className="bg-gray-800 border border-gray-700 p-4 rounded shadow flex justify-between"
            >
              {/* Left Section: Booking Details */}
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold">
                  ✈️ {booking.flight.airline} ({booking.flight.flightNumber})
                </h3>
                <p className="text-sm text-gray-400">
                  {booking.from} ➝ {booking.to}
                </p>
                <p className="text-sm text-gray-400">
                  Journey: {new Date(booking.journeyDate).toDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Booked on:{" "}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Total Fare: ₹{booking.totalFare.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  Seats: {booking.passengers.length}
                </p>

                <div className="mt-2 text-sm text-gray-300">
                  <p className="font-semibold">Passengers:</p>
                  <ul className="ml-4 list-disc">
                    {booking.passengers.map((p, idx) => (
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
                    dispatch(downloadFlightTicket(booking._id));
                    setActionMsg("Wait, Your Ticket is Getting Ready...");
                  }}
                  className="flex items-center gap-2 bg-yellow-500 text-black text-sm px-3 py-1 rounded hover:bg-yellow-600"
                >
                  <HiDownload className="text-lg" /> Download
                </button>
                <button
                  onClick={() => {
                    dispatch(mailFlightTicket(booking._id));
                    setActionMsg(
                      "Wait, You’ll get your ticket by email shortly..."
                    );
                  }}
                  className="flex items-center gap-2 bg-orange-500 text-black text-sm px-3 py-1 rounded hover:bg-orange-600"
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

export default MyFlightBookings;
