import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserBusBookings,
  downloadBusTicket,
  mailBusTicketPdf,
} from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";

import { FaDownload, FaEnvelope, FaBus, FaRoute, FaRupeeSign, FaUsers } from "react-icons/fa";

const MyBusBookings = () => {
  const dispatch = useDispatch();
  const { booking, loading, error } = useSelector((state) => state.BookBusTicket);

  useEffect(() => {
    dispatch(getUserBusBookings());
  }, [dispatch]);

  return (
    <div className="p-6 mt-16 mb-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">🚌 My Bus Bookings</h1>

      {loading && <p className="text-blue-300 text-center">Loading your bookings...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {Array.isArray(booking) && booking.length > 0 ? (
        <div className="space-y-6">
          {booking.map((b, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-lg shadow-md p-6 hover:border-blue-400 transition duration-300"
            >
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-lg">
                  <FaBus className="text-green-400" />{" "}
                  <span className="font-semibold">Bus No:</span> {b.bus?.busNumber}
                </p>
                <p className="flex items-center gap-2">
                  <FaRoute className="text-yellow-400" />{" "}
                  <span className="font-semibold">Route:</span> {b.source} → {b.destination}
                </p>
                <p>
                  <span className="font-semibold text-green-300">Date:</span>{" "}
                  {new Date(b.journeyDate).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-1">
                  <FaRupeeSign className="text-green-400" />
                  <span className="font-semibold">Fare:</span> ₹{b.totalFare} (
                  ₹{b.farePerSeat}/seat)
                </p>
              </div>

              <div className="mt-4">
                <p className="font-semibold text-yellow-400 flex items-center gap-2 mb-2">
                  <FaUsers className="text-yellow-300" />
                  Passengers:
                </p>
                <ul className="ml-5 list-disc text-sm space-y-1">
                  {b.passengers.map((p, i) => (
                    <li key={i}>
                      {p.name} ({p.gender}) — <span className="text-blue-300">Seat {p.seatNumber}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => dispatch(downloadBusTicket(b._id))}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                >
                  <FaDownload /> Download Ticket
                </button>
                <button
                  onClick={() => dispatch(mailBusTicketPdf(b._id))}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition duration-200"
                >
                  <FaEnvelope /> Mail Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-yellow-300 mt-10 text-lg">No bus bookings found yet.</p>
        )
      )}
    </div>
  );
};

export default MyBusBookings;
