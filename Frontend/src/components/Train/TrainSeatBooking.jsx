import { useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bookTrainSeats } from "../../../AllStatesFeatures/Train/BookTrainTicketSlice";
import Loading from "../../General/Loading";
import { 
  Train, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  User,
  Plus,
  X,
  Ticket,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const TrainSeatBooking = () => {
  const { state } = useLocation();
  const { loading, error } = useSelector((state) => state.bookTrainTicket);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [trainNumber, setTrainNumber] = useState(state?.trainNumber || "");
  const [trainName, setTrainName] = useState(state?.trainName || "");
  const [coachType, setCoachType] = useState(state?.coachType || "Sleeper");
  const [from, setFrom] = useState(state?.from || "");
  const [to, setTo] = useState(state?.to || "");
  const [journeyDate, setJourneyDate] = useState(
    state?.journeyDate || new Date().toISOString().split("T")[0]
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengerNames, setPassengerNames] = useState([""]);

  if (loading) {
    return (
      <Loading message="Wait ,Your Journey is Loading,We are Making Place For You " />
    );
  }

  const handlePassengerChange = (index, value) => {
    const updated = [...passengerNames];
    updated[index] = value;
    setPassengerNames(updated);
  };

  const addPassenger = () => setPassengerNames([...passengerNames, ""]);
  const removePassenger = (index) =>
    setPassengerNames(passengerNames.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainNumber || !coachType || !from || !to || !journeyDate || !passengerNames) {
      return toast.warn("All fields are required.");
    }

    if (passengerNames.some((name) => !name.trim())) {
      return toast.warn("Please fill in all passenger names.");
    }

    const dataObject = {
      userId: localStorage.getItem("userId"),
      trainNumber,
      trainName,
      coachType,
      passengerNames,
      from,
      to,
      journeyDate,
      ...(email && { email }),
      ...(phone && { phone }),
    };
    dispatch(bookTrainSeats(dataObject, navigate));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Ticket size={32} className="text-yellow-400" strokeWidth={2} />
            <h2 className="text-3xl font-bold text-white">
              Book Train Tickets
            </h2>
          </div>
          <p className="text-center text-gray-400">Complete your booking details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Train Details Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Train size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Train Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Train Name
                </label>
                <input
                  type="text"
                  value={trainName}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Train Number
                </label>
                <input
                  type="text"
                  value={trainNumber}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Coach Type
                </label>
                <input
                  type="text"
                  value={coachType}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Journey Details Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Journey Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    From Station
                  </label>
                  <input
                    type="text"
                    value={from}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    To Station
                  </label>
                  <input
                    type="text"
                    value={to}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Journey Date
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 text-gray-400 border border-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Contact Details (Optional)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Passengers Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={20} className="text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Passenger Details</h3>
              </div>
              <span className="text-sm text-gray-400">{passengerNames.length} passenger{passengerNames.length > 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-3">
              {passengerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handlePassengerChange(index, e.target.value)}
                      placeholder={`Passenger ${index + 1} name`}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                    />
                  </div>
                  {passengerNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <X size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addPassenger}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              >
                <Plus size={18} strokeWidth={2} />
                Add Another Passenger
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} strokeWidth={2} />
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainSeatBooking;