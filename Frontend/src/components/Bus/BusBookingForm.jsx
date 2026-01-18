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
  ClipboardList,
  AlertCircle
} from "lucide-react";

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

  const loading = useSelector((state) => state.BookBusTicket.loading);
  if (loading) return <Loading message="Wait!,Your Journey is Loading...." />;

  const updateField = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = async () => {
    const isIncomplete = passengers.some(
      (p) => !p.name || !p.gender || !p.email || !p.phone
    );

    if (isIncomplete) {
      toast.warning("Please complete all passenger details.");
      return;
    }
    const bookingPayload = {
      busNumber: bus.busNumber,
      journeyDate: bus.journeyDate,
      source: bus.source,
      destination: bus.destination,
      passengers: passengers,
    };
    dispatch(bookBusSeats(bookingPayload, navigate));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ClipboardList size={32} className="text-green-400" strokeWidth={2} />
          <h2 className="text-3xl font-bold text-white">
            Passenger Information
          </h2>
        </div>
        <p className="text-center text-gray-400">
          Please fill in details for all {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Passenger Forms */}
      <div className="space-y-6">
        {passengers.map((passenger, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl p-6 shadow-lg transition-all duration-300"
          >
            {/* Seat Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Armchair size={24} className="text-green-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Passenger {index + 1}</p>
                <p className="text-lg font-bold text-white">
                  Seat Number: <span className="text-green-400">{passenger.seatNumber}</span>
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
                    value={passenger.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                    value={passenger.gender}
                    onChange={(e) => updateField(index, "gender", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none"
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
                    value={passenger.email}
                    onChange={(e) => updateField(index, "email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
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
                    value={passenger.phone}
                    onChange={(e) => updateField(index, "phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          Please ensure all details are correct. Booking confirmation will be sent to the provided email addresses.
        </p>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
        >
          <CheckCircle2 size={20} strokeWidth={2} />
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BusBookingForm;