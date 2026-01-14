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
  ClipboardList,
  AlertCircle,
  Plane
} from "lucide-react";

const FlightBookingForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.BookFlightTicket.loading);

  const {
    flight,
    journeyDate,
    source: from,
    destination: to,
    seats,
  } = state || {};

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
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const p of passengers) {
      if (!p.name || !p.gender || !p.seatNumber || !p.email || !p.phone) {
        return toast.info("Please fill all fields for each passenger");
      }
    }

    const bookingData = {
      flightId: flight?._id,
      journeyDate,
      from,
      to,
      passengers,
    };

    dispatch(bookFlightSeat(bookingData, navigate));
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Invalid Flight Selection</p>
          <p className="text-gray-400">Please go back and select a flight.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loading message="Wait!,Your Journey is Loading...." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ClipboardList size={32} className="text-purple-400" strokeWidth={2} />
            <h2 className="text-3xl font-bold text-white">
              Passenger Details
            </h2>
          </div>
          <p className="text-center text-gray-400">
            Please fill in details for all {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {passengers.map((p, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 shadow-lg transition-all duration-300"
            >
              {/* Passenger Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Armchair size={24} className="text-purple-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Passenger {idx + 1}</p>
                  <p className="text-lg font-bold text-white">
                    Seat Number: <span className="text-purple-400">{p.seatNumber}</span>
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={p.name}
                      onChange={(e) => handleChange(idx, "name", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Gender Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Gender *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <UserCircle size={18} />
                    </div>
                    <select
                      value={p.gender}
                      onChange={(e) => handleChange(idx, "gender", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                      required
                    >
                      <option value="" className="text-gray-500">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={p.email}
                      onChange={(e) => handleChange(idx, "email", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={p.phone}
                      onChange={(e) => handleChange(idx, "phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Please ensure all details are correct. Booking confirmation will be sent to the provided email addresses.
            </p>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={passengers.length === 0}
              className={`${
                passengers.length === 0
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
              } text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-2`}
            >
              <CheckCircle2 size={20} strokeWidth={2} />
              Confirm Booking ({passengers.length} Seat{passengers.length > 1 ? "s" : ""})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightBookingForm;