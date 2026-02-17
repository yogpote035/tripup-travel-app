import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { bookBusSeats } from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";
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
import { FaPlane } from "react-icons/fa";

const perforation =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";
const dashedH =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const TearLine = ({ label }) => (
  <div className="flex items-center px-2">
    <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-8 flex-shrink-0" />
    <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
    {label && (
      <span className="text-xs font-black tracking-widest text-stone-300 uppercase px-3 whitespace-nowrap">
        {label}
      </span>
    )}
    {label && <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />}
    <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-8 flex-shrink-0" />
  </div>
);

const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-orange-50 border-2 border-orange-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all text-sm font-medium";

const BusBookingForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSeats, bus } = state;

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatNumber: seat.seatNumber,
      name: "",
      gender: "",
      email: "",
      phone: "",
    }))
  );

  const loading = useSelector((s) => s.BookBusTicket.loading);
  if (loading) return <Loading message="Wait! Your Journey is Loading..." />;

  const updateField = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = () => {
    const isIncomplete = passengers.some(
      (p) => !p.name || !p.gender || !p.email || !p.phone
    );
    if (isIncomplete) {
      toast.warning("Please complete all passenger details.");
      return;
    }
    dispatch(
      bookBusSeats(
        {
          busNumber: bus.busNumber,
          journeyDate: bus.journeyDate,
          source: bus.source,
          destination: bus.destination,
          passengers,
        },
        navigate
      )
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── MAIN BOARDING PASS CARD ── */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">

          {/* Top perforation */}
          <div className="h-1.5 w-full" style={{ background: perforation }} />

          {/* Dark header */}
          <div className="bg-stone-900 px-7 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black tracking-widest text-stone-500 uppercase mb-0.5">
                  Boarding Pass · Bus
                </p>
                <p className="text-white font-black text-lg tracking-widest uppercase">
                  TRIPUP AIRWAYS
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <FaPlane className="text-orange-400 text-base" />
              </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">From</p>
                <p className="font-black text-2xl text-white tracking-widest leading-none">
                  {bus.source?.slice(0, 3).toUpperCase() || "SRC"}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{bus.source}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <FaPlane className="text-orange-400 text-sm" />
                <div className="w-full h-px" style={{ background: dashedH }} />
                <p className="text-xs text-stone-600 tracking-widest uppercase">
                  {bus.journeyDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">To</p>
                <p className="font-black text-2xl text-orange-400 tracking-widest leading-none">
                  {bus.destination?.slice(0, 3).toUpperCase() || "DST"}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{bus.destination}</p>
              </div>
            </div>

            {/* Bus info pills */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="bg-stone-800 border border-stone-700 text-stone-300 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full">
                BUS · {bus.busNumber}
              </span>
              <span className="bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full">
                {passengers.length} PASSENGER{passengers.length > 1 ? "S" : ""}
              </span>
            </div>
          </div>

          {/* Tear line */}
          <TearLine label="Passenger Details" />

          {/* Passenger forms */}
          <div className="px-7 py-6 space-y-6">
            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="border-2 border-orange-200 rounded-2xl overflow-hidden"
              >
                {/* Mini perforation */}
                <div className="h-1 w-full" style={{ background: perforation }} />

                {/* Seat header */}
                <div className="bg-stone-900 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Armchair size={16} className="text-orange-400" strokeWidth={1.5} />
                    <span className="text-xs font-black tracking-widest text-stone-400 uppercase">
                      Passenger {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 uppercase tracking-widest">Seat</span>
                    <span className="font-black text-orange-400 text-base tracking-widest">
                      {passenger.seatNumber}
                    </span>
                  </div>
                </div>

                {/* Tear line */}
                <div className="flex items-center px-2 bg-white">
                  <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
                  <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
                  <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
                </div>

                {/* Fields */}
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={passenger.name}
                        onChange={(e) => updateField(index, "name", e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">
                      Gender *
                    </label>
                    <div className="relative">
                      <UserCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <select
                        value={passenger.gender}
                        onChange={(e) => updateField(index, "gender", e.target.value)}
                        className={`${inputClass} appearance-none`}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" width="10" height="6" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={passenger.email}
                        onChange={(e) => updateField(index, "email", e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        placeholder="+91 XXXXXXXXXX"
                        value={passenger.phone}
                        onChange={(e) => updateField(index, "phone", e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info notice */}
          <div className="mx-7 mb-4 flex items-start gap-3 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              Please ensure all details are correct. Booking confirmation will be sent to the provided email addresses.
            </p>
          </div>

          {/* Tear line before footer */}
          <TearLine />

          {/* Dark footer with confirm button */}
          <div className="bg-stone-900 px-7 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black tracking-widest text-stone-500 uppercase mb-0.5">
                Ready to board?
              </p>
              <p className="text-stone-400 text-xs">
                {passengers.length} seat{passengers.length > 1 ? "s" : ""} selected
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md uppercase tracking-widest text-sm"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              Confirm Booking
            </button>
          </div>

          {/* Barcode */}
          <div className="bg-stone-900 px-7 pb-4 border-t border-stone-800">
            <div className="flex items-end gap-px h-7 mb-1.5">
              {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,3,1,2,1,4,2,1,3,1,2,3,1,2,1,3,2,1].map((w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-sm"
                  style={{
                    width: `${w * 2.5}px`,
                    height: `${50 + (i % 3) * 20}%`,
                    opacity: 0.08 + (i % 4) * 0.15,
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs tracking-widest text-stone-600 uppercase font-semibold">
              TRIPUP · BON VOYAGE
            </p>
          </div>

          {/* Bottom perforation */}
          <div className="h-1.5 w-full" style={{ background: perforation }} />
        </div>

      </div>
    </div>
  );
};

export default BusBookingForm;