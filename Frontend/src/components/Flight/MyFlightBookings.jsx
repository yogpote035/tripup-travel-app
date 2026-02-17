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
  ArrowRight,
} from "lucide-react";

const MyFlightBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchBooking = () => dispatch(fetchMyFlightBookings());

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBooking();
  }, [dispatch]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setShowConfirm(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const { booking, loading, error } = useSelector((s) => s.BookFlightTicket);
  const { loading: loadingAll, error: errorAll } = useSelector((s) => s.flight);

  if (loadingAll) return <Loading message={actionMsg} color="border-t-orange-500" />;

  const handleCancel = () => {
    if (!selectedBookingId) return toast.warn("Booking ID missing");
    setActionMsg("Cancelling your ticket…");
    dispatch(cancelFlightTicket(selectedBookingId));
    setShowConfirm(false);
    setTimeout(fetchBooking, 1500);
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Flight Bookings</h1>
          <p className="text-sm text-stone-500 mt-1">View and manage your flight reservations.</p>
        </div>

        {/* Loading */}
        {loading && <Loading message="Fetching bookings…" color="border-t-orange-500" />}

        {/* Error */}
        {(error || errorAll) && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <p className="text-red-500 text-sm">{error || errorAll}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && booking?.length === 0 && (
          <div className="bg-white border border-orange-200 rounded-2xl p-12 text-center shadow-sm">
            <Plane size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-stone-500 font-medium mb-1">No bookings found</p>
            <p className="text-stone-400 text-sm">Your flight booking history will appear here.</p>
          </div>
        )}

        {/* Booking cards */}
        <div className="space-y-4">
          {booking?.map((b) => {
            const isCancelled = b.status === "cancelled";
            return (
              <div
                key={b._id}
                className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-orange-100">
                  <div className="flex items-center gap-2">
                    {isCancelled ? (
                      <>
                        <XCircle size={14} className="text-red-400" />
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Cancelled</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Confirmed</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Calendar size={12} />
                    Booked {new Date(b.bookingDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-6 flex flex-col lg:flex-row gap-6">
                  {/* Left: details */}
                  <div className="flex-1 space-y-4">
                    {/* Airline + route */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Plane size={15} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{b.flight.airline}</p>
                        <p className="text-xs text-stone-400">{b.flight.flightNumber}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-stone-500 text-xs">
                          <MapPin size={11} className="text-orange-400" />
                          {b.from}
                          <ArrowRight size={11} />
                          {b.to}
                        </div>
                      </div>
                    </div>

                    {/* Journey date */}
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Calendar size={13} className="text-orange-400 shrink-0" />
                      Journey: {new Date(b.journeyDate).toDateString()}
                    </div>

                    {/* Fare */}
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
                        <IndianRupee size={16} strokeWidth={2.5} />
                        {b.totalFare.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                        <Users size={13} />
                        {b.passengers.length} seat{b.passengers.length > 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="border border-orange-100 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-orange-100 bg-orange-50">
                        <Users size={13} className="text-orange-500" />
                        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Passengers</p>
                      </div>
                      <ul className="divide-y divide-orange-50">
                        {b.passengers.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                            <span className="bg-orange-100 text-orange-600 font-mono text-xs px-2 py-0.5 rounded-lg shrink-0">
                              {p.seatNumber}
                            </span>
                            <span className="text-stone-700 font-medium">{p.name}</span>
                            <span className="text-stone-400 text-xs ml-auto">{p.gender}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:w-36 shrink-0">
                    <button
                      onClick={() => {
                        dispatch(downloadFlightTicket(b._id));
                        setActionMsg("Preparing your ticket…");
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      <Download size={14} strokeWidth={2} />
                      Download
                    </button>

                    <button
                      onClick={() => {
                        dispatch(mailFlightTicket(b._id));
                        setActionMsg("Sending ticket to your email…");
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      <Mail size={14} strokeWidth={2} />
                      Email
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => {
                          setSelectedBookingId(b._id);
                          setShowConfirm(true);
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-400 hover:text-red-500 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      >
                        <XCircle size={14} strokeWidth={2} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white border border-orange-200 rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="font-semibold text-stone-800">Cancel this ticket?</p>
            </div>
            <p className="text-stone-500 text-sm mb-5 pl-12">
              This action cannot be undone and your seat will be released.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 rounded-lg text-sm font-medium transition-all"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
              >
                Cancel ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFlightBookings;