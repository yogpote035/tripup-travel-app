import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyFlightBookings } from "../../../AllStatesFeatures/Flight/BookFlightSeatSlice";
import Loading from "../../General/Loading";

const MyFlightBookings = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMyFlightBookings());
  }, [dispatch]);

  const { booking, loading, error } = useSelector(
    (state) => state.BookFlightTicket
  );

  return (
    <div className="min-h-screen bg-gray-900 mt-10 mb-10 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          🛫 My Flight Bookings
        </h2>

        {loading && <Loading message="Fetching bookings..." />}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && booking?.length === 0 && (
          <p className="text-gray-400">You have no flight bookings.</p>
        )}

        <div className="space-y-4">
          {booking?.map((booking) => (
            <div
              key={booking._id}
              className="bg-gray-800 border border-gray-700 p-4 rounded shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    ✈️ {booking.flight.airline} ({booking.flight.flightNumber})
                  </h3>
                  <p className="text-sm text-gray-400">
                    {booking.from} ➝ {booking.to}
                  </p>
                  <p className="text-sm text-gray-400">
                    Journey: {new Date(booking.journeyDate).toDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">
                    ₹{booking.totalFare.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Booked on:{" "}
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Seats: {booking.passengers.length}
                  </p>
                </div>
              </div>

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
              <div className="flex gap-4">
                <button className="mt-3 bg-yellow-500 text-black px-4 py-1 rounded hover:bg-yellow-600">
                  📥 Download Ticket
                </button>
                <button className="mt-3 bg-orange-500 text-black px-4 py-1 rounded hover:bg-yellow-600">
                  📥 Mail Ticket
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
