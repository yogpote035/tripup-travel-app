import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserBusBookings,
  downloadBusTicket,
  mailBusTicketPdf,
  cancelBusTicket,
} from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";
import { FaBus } from "react-icons/fa";
import {
  Download,
  Mail,
  XCircle,
  Bus,
  Calendar,
  Users,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

// ── Shared token ──────────────────────────────────────────────────────────────
const dashedH = {
  background:
    "repeating-linear-gradient(90deg,#fed7aa 0,#fed7aa 8px,transparent 8px,transparent 16px)",
};

function RouteDivider() {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <FaBus className="text-orange-400" size={13} />
      <div className="w-full h-px" style={dashedH} />
    </div>
  );
}

function StatusBadge({ cancelled }) {
  return cancelled ? (
    <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">
      <XCircle size={10} strokeWidth={2.5} /> Cancelled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
      <CheckCircle2 size={10} strokeWidth={2.5} /> Confirmed
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const MyBusBookings = () => {
  const dispatch = useDispatch();
  const [actionMsg, setActionMsg] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const { booking, loading, error } = useSelector((s) => s.BookBusTicket);

  useEffect(() => { dispatch(getUserBusBookings()); }, [dispatch]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setShowConfirm(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  if (loading) return <Loading message={actionMsg || "Fetching bookings…"} color="border-t-orange-500" />;

  const handleCancel = () => {
    if (!selectedBookingId) return toast.warn("Booking ID missing");
    setActionMsg("Cancelling your ticket…");
    dispatch(cancelBusTicket(selectedBookingId));
    setShowConfirm(false);
    setTimeout(() => dispatch(getUserBusBookings()), 1500);
  };

  // Derive short route codes from city names
  const cityCode = (name) =>
    name?.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X") || "???";

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Heading */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">My Bus Bookings</h1>
            <p className="text-sm text-stone-500 mt-1">View and manage your reservations.</p>
          </div>
          {booking?.length > 0 && (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">
              {booking.length} booking{booking.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && booking?.length === 0 && (
          <div className="bg-white border border-orange-200 rounded-2xl p-12 text-center shadow-sm">
            <Bus size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-stone-500 font-medium mb-1">No bookings found</p>
            <p className="text-stone-400 text-sm">Your bus booking history will appear here.</p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {booking?.map((b) => {
            const isCancelled = b.status === "cancelled";
            const isExpanded = expandedId === b._id;
            const fromCode = cityCode(b.source);
            const toCode   = cityCode(b.destination);

            return (
              <div
                key={b._id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${
                  isCancelled
                    ? "border-stone-200 opacity-70"
                    : "border-orange-200 hover:shadow-md transition-shadow duration-200"
                }`}
              >
                {/* Top strip: bus number + status */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-orange-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <Bus size={13} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800 leading-tight">{b.bus?.busNumber}</p>
                      <p className="text-xs text-stone-400">{b.bus?.busName || "Bus Service"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                      <Calendar size={11} />
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </div>
                    <StatusBadge cancelled={isCancelled} />
                  </div>
                </div>

                {/* Route block */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="text-2xl font-bold text-stone-800 tracking-widest leading-none">{fromCode}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[80px]">{b.source}</p>
                    </div>

                    <RouteDivider />

                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500 tracking-widest leading-none">{toCode}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[80px] text-right">{b.destination}</p>
                    </div>
                  </div>

                  {/* Journey date + fare */}
                  <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
                      <Calendar size={12} className="text-orange-400" />
                      {new Date(b.journeyDate).toDateString()}
                    </div>
                    <div className="flex items-center gap-0.5 text-orange-500 font-bold text-base">
                      <IndianRupee size={14} strokeWidth={2.5} />
                      {b.totalFare.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Passenger row + expand */}
                <div className="px-6 pb-4 space-y-3 border-t border-orange-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Users size={13} className="text-orange-400" />
                      <span className="font-medium">
                        {b.passengers.length} passenger{b.passengers.length > 1 ? "s" : ""}
                      </span>
                      <span className="text-stone-300 text-xs">
                        · {b.passengers.map((p) => p.seatNumber).join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : b._id)}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      {isExpanded ? "Hide ↑" : "Details ↓"}
                    </button>
                  </div>

                  {/* Expandable passengers */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isExpanded ? "400px" : "0", opacity: isExpanded ? 1 : 0 }}
                  >
                    <div className="border border-orange-100 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border-b border-orange-100">
                        <Users size={12} className="text-orange-500" />
                        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Passengers</p>
                        {b.farePerSeat && (
                          <span className="ml-auto text-xs text-stone-400">
                            ₹{b.farePerSeat} / seat
                          </span>
                        )}
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        dispatch(downloadBusTicket(b._id));
                        setActionMsg("Preparing your ticket…");
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      <Download size={13} strokeWidth={2} />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        dispatch(mailBusTicketPdf(b._id));
                        setActionMsg("Sending ticket to your email…");
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      <Mail size={13} strokeWidth={2} />
                      Email
                    </button>
                    {!isCancelled && (
                      <button
                        onClick={() => { setSelectedBookingId(b._id); setShowConfirm(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-400 hover:text-red-500 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      >
                        <XCircle size={13} strokeWidth={2} />
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

export default MyBusBookings;