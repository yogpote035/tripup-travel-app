import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBusesBetweenStations } from "../../../AllStatesFeatures/Bus/AllBusSlice";
import { toast } from "react-toastify";
import { Bus, MapPin, Calendar, Search, AlertCircle, Loader2 } from "lucide-react";

const BusSearch = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.bus);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      toast.error("Please fill all fields");
      return;
    }
    dispatch(fetchBusesBetweenStations({ from, to, date }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl mt-10 shadow-2xl max-w-3xl mx-auto text-white border border-gray-700"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <Bus size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Search Buses
        </h2>
        <p className="text-gray-400 text-sm mt-2">Find the best bus for your journey</p>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* From Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="w-full bg-gray-700 text-white border border-gray-600 p-3 pl-11 rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>

        {/* To Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            className="w-full bg-gray-700 text-white border border-gray-600 p-3 pl-11 rounded-xl placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Date Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400">
            <Calendar size={20} />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-gray-700 text-white border border-gray-600 p-3 pl-11 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
          loading
            ? "bg-gradient-to-r from-green-500 to-emerald-600 opacity-50 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02]"
        }`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search size={20} />
            Search Buses
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
};

export default BusSearch;