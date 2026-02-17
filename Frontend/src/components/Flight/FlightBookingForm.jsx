import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { bookFlightSeat } from "../../../AllStatesFeatures/Flight/BookFlightSeatSlice";
import { toast } from "react-toastify";
import Loading from "../../General/Loading";
import {
  User,
  Mail,
  Phone,
  UserCircle,
  Armchair,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const inputCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
      {label}
    </label>
    {children}
  </div>
);

const FlightBookingForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((s) => s.BookFlightTicket.loading);

  const { flight, journeyDate, source: from, destination: to, seats } = state || {};

  const [passengers, setPassengers] = useState(
    seats?.map((seat) => ({
      name: "",
      gender: "",
      seatNumber: seat || "",
      email: "",
      phone: "",
    })) || []
  );

  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const p of passengers) {
      if (!p.name || !p.gender || !p.seatNumber || !p.email || !p.phone)
        return toast.info("Please fill all fields for each passenger");
    }
    dispatch(bookFlightSeat({ flightId: flight?._id, journeyDate, from, to, passengers }, navigate));
  };

  if (!state)
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white border border-orange-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle size={28} className="text-orange-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-stone-700 font-semibold mb-1">Invalid flight selection</p>
          <p className="text-stone-400 text-sm">Please go back and select a flight.</p>
        </div>
      </div>
    );

  if (loading) return <Loading message="Booking your seats…" color="border-t-orange-500" />;

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Passenger Details</h1>
          <p className="text-sm text-stone-500 mt-1">
            Fill in details for {passengers.length} passenger{passengers.length > 1 ? "s" : ""}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {passengers.map((p, idx) => (
            <div
              key={idx}
              className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Passenger header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-orange-100">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                  <Armchair size={15} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">
                    Passenger {idx + 1}
                  </p>
                  <p className="text-sm font-semibold text-stone-700">
                    Seat{" "}
                    <span className="text-orange-500">{p.seatNumber}</span>
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <div className="relative">
                    <User size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={p.name}
                      onChange={(e) => handleChange(idx, "name", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                </Field>

                <Field label="Gender">
                  <div className="relative">
                    <UserCircle size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    <select
                      value={p.gender}
                      onChange={(e) => handleChange(idx, "gender", e.target.value)}
                      className={inputCls + " appearance-none pr-8"}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400"
                      width="10" height="6" viewBox="0 0 10 6" fill="none"
                    >
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </Field>

                <Field label="Email Address">
                  <div className="relative">
                    <Mail size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={p.email}
                      onChange={(e) => handleChange(idx, "email", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                </Field>

                <Field label="Phone Number">
                  <div className="relative">
                    <Phone size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={p.phone}
                      onChange={(e) => handleChange(idx, "phone", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                </Field>
              </div>
            </div>
          ))}

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-orange-100/60 border border-orange-200 rounded-xl">
            <AlertCircle size={14} className="text-orange-400 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-stone-500">
              Please ensure all details are correct. Booking confirmation will be sent to the provided email addresses.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={passengers.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed text-sm"
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            Confirm Booking — {passengers.length} Seat{passengers.length > 1 ? "s" : ""}
          </button>
        </form>

      </div>
    </div>
  );
};

export default FlightBookingForm;