import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchTrainsBetweenStations } from "../../../AllStatesFeatures/Train/AllTrainsSlice";
import { 
  ArrowDownUp, 
  MapPin, 
  Calendar, 
  Search,
  Train,
  X
} from "lucide-react";

const SearchTrain = ({ onDateChange }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [trainType, setTrainType] = useState("");

  const dispatch = useDispatch();

  const handleSwap = () => {
    if (!from && !to) return;
    setFrom(to);
    setTo(from);
    toast.success("Stations swapped!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from || !to || !date) return toast.warn("Fields are required");
    if (from.toLowerCase() === to.toLowerCase())
      return toast.info("From and To cannot be same");

    const payload = { from, to };

    if (date) {
      onDateChange(date);
      const day = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      payload.day = day;
    }

    if (trainType) {
      payload.trainType = trainType;
    }

    dispatch(fetchTrainsBetweenStations(payload));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg mb-4">
          <Train size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Search Trains
        </h2>
        <p className="text-gray-400 mt-2">Find trains between stations</p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-white p-6 rounded-2xl shadow-xl space-y-5"
      >
        {/* From Station */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            From Station
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter departure station"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Swap Button */}
        {from && to && (
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleSwap}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-yellow-400 hover:text-yellow-300 transition-all shadow-lg hover:shadow-xl hover:scale-110"
              title="Swap stations"
            >
              <ArrowDownUp size={20} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* To Station */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            To Station
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter destination station"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Train Type */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Train Type (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Train size={18} />
            </div>
            <select
              value={trainType}
              onChange={(e) => setTrainType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all appearance-none"
            >
              <option value="">All Train Types</option>
              <option value="Express">Express</option>
              <option value="Shatabdi">Shatabdi</option>
              <option value="Superfast">Superfast</option>
              <option value="Intercity">Intercity</option>
              <option value="Mail">Mail</option>
              <option value="Vande Bharat">Vande Bharat</option>
              <option value="Rajdhani">Rajdhani</option>
              <option value="Duronto">Duronto</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Date of Journey
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={date}
                required
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                title="Clear date"
              >
                <X size={18} strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Search size={20} strokeWidth={2} />
          Find Trains
        </button>
      </form>
    </div>
  );
};

export default SearchTrain;