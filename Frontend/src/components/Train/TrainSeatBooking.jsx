import { useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bookTrainSeats } from "../../../AllStatesFeatures/Train/BookTrainTicketSlice";
import Loading from "../../General/Loading";
import { LuxuryDatePicker } from "../General/LuxuryCalendar";
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
  AlertCircle,
} from "lucide-react";

const inputCls =
  "w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const disabledInputCls =
  "w-full pl-4 pr-4 py-3 rounded-xl bg-stone-100 border border-orange-100 text-stone-400 text-sm cursor-not-allowed";

const Label = ({ children }) => (
  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">
    {children}
  </label>
);

const SectionCard = ({ icon, title, badge, children }) => (
  <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="bg-orange-50 border border-orange-200 rounded-lg w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-base font-bold text-stone-800">{title}</h3>
      </div>
      {badge && <span className="text-xs font-semibold text-stone-400">{badge}</span>}
    </div>
    {children}
  </div>
);

const TrainSeatBooking = () => {
  const { state } = useLocation();
  const { loading, error } = useSelector((s) => s.bookTrainTicket);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [trainNumber] = useState(state?.trainNumber || "");
  const [trainName] = useState(state?.trainName || "");
  const [coachType] = useState(state?.coachType || "Sleeper");
  const [from] = useState(state?.from || "");
  const [to] = useState(state?.to || "");
  const [journeyDate] = useState(
    state?.journeyDate || new Date().toISOString().split("T")[0]
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengerNames, setPassengerNames] = useState([""]);

  if (loading) {
    return <Loading message="Wait, Your Journey is Loading. We are Making Place For You" />;
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
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Page Header */}
        <div className="bg-white border border-orange-200 rounded-2xl px-6 py-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-2">
              <Ticket size={22} className="text-orange-500" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-stone-800">Book Train Tickets</h2>
          </div>
          <p className="text-sm text-stone-400 mt-1">Complete your booking details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Train Details */}
          <SectionCard icon={<Train size={16} className="text-orange-500" />} title="Train Details">
            <div className="space-y-4">
              <div>
                <Label>Train Name</Label>
                <input type="text" value={trainName} disabled className={disabledInputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Train Number</Label>
                  <input type="text" value={trainNumber} disabled className={disabledInputCls} />
                </div>
                <div>
                  <Label>Coach Type</Label>
                  <input type="text" value={coachType} disabled className={disabledInputCls} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Journey Details */}
          <SectionCard icon={<MapPin size={16} className="text-orange-500" />} title="Journey Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Station</Label>
                  <input type="text" value={from} disabled className={disabledInputCls} />
                </div>
                <div>
                  <Label>To Station</Label>
                  <input type="text" value={to} disabled className={disabledInputCls} />
                </div>
              </div>
              <div>
                <Label>Journey Date</Label>
                <LuxuryDatePicker value={journeyDate} disabled />
              </div>
            </div>
          </SectionCard>

          {/* Contact Details */}
          <SectionCard
            icon={<Phone size={16} className="text-orange-500" />}
            title="Contact Details"
            badge="Optional"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Passenger Details */}
          <SectionCard
            icon={<User size={16} className="text-orange-500" />}
            title="Passenger Details"
            badge={`${passengerNames.length} passenger${passengerNames.length > 1 ? "s" : ""}`}
          >
            <div className="space-y-3">
              {passengerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handlePassengerChange(index, e.target.value)}
                      placeholder={`Passenger ${index + 1} name`}
                      className={inputCls}
                    />
                  </div>
                  {passengerNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-400 hover:text-red-500 rounded-xl transition-all flex-shrink-0"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addPassenger}
                className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors mt-1"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Another Passenger
              </button>
            </div>
          </SectionCard>

          {/* Error */}
          {error && (
            <div className="bg-white border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-4 rounded-xl transition-all text-sm tracking-wide flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle2 size={18} strokeWidth={2.5} />
            Confirm Booking
          </button>
        </form>

      </div>
    </div>
  );
};

export default TrainSeatBooking;
