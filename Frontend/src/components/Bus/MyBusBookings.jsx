import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserBusBookings,
  downloadBusTicket,
  mailBusTicketPdf,
  cancelBusTicket,
} from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";
import Loading from "../../General/Loading";
import { HiDownload, HiOutlineMail } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";

const MyBusBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { booking, loading, error } = useSelector(
    (state) => state.BookBusTicket
  );

  function fetchBooking() {
    dispatch(getUserBusBookings());
  }

  useEffect(() => {
    fetchBooking();
  }, [dispatch]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading) {
    return <Loading message={actionMsg || "Fetching Your Bus Bookings..."} />;
  }
  const handleCancel = async () => {
    if (!selectedBookingId) return toast.warn("Booking Id Missing");

    setActionMsg("Cancelling your ticket...");
    try {
      dispatch(cancelBusTicket(selectedBookingId));

      setShowConfirm(false);
      setTimeout(() => {
        fetchBooking();
      }, 1500);
    } catch (err) {
      alert("Failed to cancel ticket.");
    }
  };
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
                <h3 className="text-lg font-bold">🚌 {b.bus?.busNumber}</h3>
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
                  Total Fare: ₹{b.totalFare.toLocaleString()} ( ₹{b.farePerSeat}
                  /seat)
                </p>
                <p className="text-sm text-gray-400">
                  Seats: {b.passengers.length}
                </p>
                {b.status === "cancelled" ? (
                  <p className="text-sm text-red-500">
                    Booking Status: {b.status || "N/A"}
                  </p>
                ) : (
                  <p className="text-sm text-green-400">
                    Booking Status: {b.status || "N/A"}
                  </p>
                )}

                <div className="text-sm text-gray-300">
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
                  className="flex items-center gap-2 bg-gray-300 text-black text-sm px-3 py-1 rounded hover:bg-amber-100"
                >
                  <HiDownload className="text-lg" /> Download Ticket
                </button>
                <button
                  onClick={() => {
                    dispatch(mailBusTicketPdf(b._id));
                    setActionMsg(
                      "Wait, You’ll get your ticket by email shortly..."
                    );
                  }}
                  className="flex items-center gap-2 bg-amber-50 text-black text-sm px-3 py-1 rounded hover:bg-amber-100"
                >
                  <HiOutlineMail className="text-lg" /> Mail Ticket
                </button>
                {b.status === "booked" && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(b._id);
                      setShowConfirm(true);
                    }}
                    className="flex items-center gap-2 bg-amber-50 text-black text-sm px-3 py-1 rounded hover:bg-amber-100 outline-none focus:outline-none"
                  >
                    <MdCancel className="text-xl text-red-500" />
                    Cancel Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)} // Click outside = close
        >
          <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-black dark:text-white p-6 rounded-xl shadow-2xl border border-white/20 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent inner click from closing
          >
            <h3 className="text-lg font-semibold mb-2">
              Cancel Flight Ticket?
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to cancel this ticket? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
              >
                No
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBusBookings;
