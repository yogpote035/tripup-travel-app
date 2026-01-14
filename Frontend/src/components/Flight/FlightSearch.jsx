import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlightsBetweenAirports } from "../../../AllStatesFeatures/Flight/AllFlightSlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Calendar,
  Search,
  Plane,
  Clock,
  IndianRupee,
  ArrowRight,
  Armchair,
  AlertCircle
} from "lucide-react";

const FlightSearch = () => {
  const dispatch = useDispatch();
  const { flights, from, to, loading, error, date } = useSelector(
    (state) => state.flight
  );
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!source || !destination || !selectedDate) {
      return toast.info("Please fill all fields");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return toast.info("Please select today or a future date.");
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];
    dispatch(
      fetchFlightsBetweenAirports({
        from: source,
        to: destination,
        date: formattedDate,
      })
    );
  };

  const CustomDateInput = React.forwardRef(
    ({ value, onClick }, ref) => (
      <div
        className="relative cursor-pointer w-full"
        onClick={onClick}
        ref={ref}
      >
        <Calendar size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500" />
        <input
          value={value}
          required
          onChange={() => {}}
          placeholder="Select travel date"
          readOnly
          className="pl-10 pr-4 py-3 w-full rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
        />
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Plane size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Search Flights
            </h2>
          </div>
          <p className="text-gray-400 ml-14">Find the best flights for your journey</p>
        </div>

        {/* Search Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* From Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  From
                </label>
                <div className="relative">
                  <PlaneTakeoff size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500" />
                  <input
                    type="text"
                    value={source}
                    required
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="pl-10 pr-4 py-3 w-full rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* To Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  To
                </label>
                <div className="relative">
                  <PlaneLanding size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="pl-10 pr-4 py-3 w-full rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Travel Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  required
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select travel date"
                  customInput={<CustomDateInput />}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Search size={20} strokeWidth={2} />
              Search Flights
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && <Loading message="Fetching flights..." />}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Flight Results */}
        {!loading && flights?.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-4">
              <Plane size={24} className="text-purple-400" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-semibold text-white">Available Flights</h3>
                <p className="text-sm text-gray-400">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>

            {flights.map((flight, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Flight Header */}
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-gray-700 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Plane size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{flight.airline}</h4>
                        <p className="text-sm text-gray-400">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-2xl font-bold text-purple-400">
                        <IndianRupee size={20} strokeWidth={2.5} />
                        <span>{flight.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Flight Route */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PlaneTakeoff size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400">{flight.from}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{flight.departureTime}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                        <Clock size={14} />
                        <span>{flight.duration}</span>
                      </div>
                      <div className="w-full max-w-[120px] relative">
                        <div className="h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-full"></div>
                        <div className="absolute -top-1 left-0 w-3 h-3 bg-purple-400 rounded-full"></div>
                        <div className="absolute -top-1 right-0 w-3 h-3 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className="text-sm text-gray-400">{flight.to}</span>
                        <PlaneLanding size={16} className="text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">{flight.arrivalTime}</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() =>
                      navigate(`/flight-seat/${flight._id}`, {
                        state: {
                          flight: flight,
                          journeyDate: date,
                          source: from,
                          destination: to,
                        },
                      })
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Armchair size={20} strokeWidth={2} />
                    Book Seats
                    <ArrowRight size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Flights Found */}
        {!loading && flights?.length === 0 && from && to && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
            <Plane size={64} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-400 text-lg mb-2">No flights found</p>
            <p className="text-gray-500 text-sm">
              No flights available from {from} to {to} on the selected date
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;