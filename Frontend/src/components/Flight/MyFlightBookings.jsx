import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyFlightBookings } from "../../../AllStatesFeatures/Flight/BookFlightSeatSlice";
import {
  downloadFlightTicket,
  mailFlightTicket,
  cancelFlightTicket,
} from "../../../AllStatesFeatures/Flight/AllFlightSlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";
import { 
  Download, 
  Mail, 
  XCircle, 
  Plane,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

const MyFlightBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function fetchBooking() {
    dispatch(fetchMyFlightBookings());
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBooking();
  }, [dispatch]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const { booking, loading, error } = useSelector(
    (state) => state.BookFlightTicket
  );
  const { loading: loadingAll, error: errorAll } = useSelector(
    (state) => state.flight
  );

  if (loadingAll) return <Loading message={actionMsg} />;

  const handleCancel = async () => {
    if (!selectedBookingId) return toast.warn("Booking Id Missing");

    setActionMsg("Cancelling your ticket...");
    try {
      dispatch(cancelFlightTicket(selectedBookingId));
      setShowConfirm(false);
      setTimeout(() => {
        fetchBooking();
      }, 1500);
    } catch (err) {
      alert("Failed to cancel ticket.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Plane size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              My Flight Bookings
            </h2>
          </div>
          <p className="text-gray-400 ml-14">View and manage all your flight reservations</p>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Fetching Your Flight bookings..." />}

        {/* Error State */}
        {(error || errorAll) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <p className="text-red-400">{error || errorAll}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && booking?.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
            <Plane size={64} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-400 text-lg mb-2">No flight bookings found</p>
            <p className="text-gray-500 text-sm">Your flight booking history will appear here</p>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {booking?.map((booking) => (
            <div
              key={booking._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Status Banner */}
              <div className={`px-6 py-3 border-b border-gray-700 ${
                booking.status === "cancelled" 
                  ? "bg-red-500/10" 
                  : "bg-purple-500/10"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {booking.status === "cancelled" ? (
                      <>
                        <XCircle size={18} className="text-red-400" />
                        <span className="text-sm font-semibold text-red-400">Cancelled</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} className="text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Confirmed</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={14} />
                    <span>Booked: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left Section: Booking Details */}
                  <div className="flex-1 space-y-4">
                    {/* Flight Info */}
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Plane size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {booking.flight.airline}
                        </h3>
                        <p className="text-sm text-gray-400">{booking.flight.flightNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-400">{booking.from}</span>
                          <ArrowRight size={14} className="text-gray-600" />
                          <span className="text-sm text-gray-400">{booking.to}</span>
                        </div>
                      </div>
                    </div>

                    {/* Journey Date */}
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm">Journey: {new Date(booking.journeyDate).toDateString()}</span>
                    </div>

                    {/* Fare Info */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IndianRupee size={18} className="text-purple-400" />
                          <span className="text-2xl font-bold text-purple-400">
                            {booking.totalFare.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users size={14} />
                          <span>{booking.passengers.length} seat{booking.passengers.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-gray-400" />
                        <p className="font-semibold text-white text-sm">Passengers</p>
                      </div>
                      <ul className="space-y-2">
                        {booking.passengers.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="bg-purple-500/20 px-2 py-1 rounded text-purple-400 font-mono text-xs">
                              {p.seatNumber}
                            </div>
                            <span>{p.name}</span>
                            <span className="text-gray-500">({p.gender})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Section: Actions */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    <button
                      onClick={() => {
                        dispatch(downloadFlightTicket(booking._id));
                        setActionMsg("Wait, Your Ticket is Getting Ready...");
                      }}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Download size={18} strokeWidth={2} />
                      Download
                    </button>

                    <button
                      onClick={() => {
                        dispatch(mailFlightTicket(booking._id));
                        setActionMsg("Wait, You'll get your ticket by email shortly...");
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Mail size={18} strokeWidth={2} />
                      Email Ticket
                    </button>

                    {booking.status === "booked" && (
                      <button
                        onClick={() => {
                          setSelectedBookingId(booking._id);
                          setShowConfirm(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        <XCircle size={18} strokeWidth={2} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-gray-800 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Cancel Flight Ticket?</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel this ticket? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
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

export default MyFlightBookings;