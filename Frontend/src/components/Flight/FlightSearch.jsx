import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlightsBetweenAirports } from "../../../AllStatesFeatures/Flight/AllFlightSlice";
import { searchLocations } from "../../../AllStatesFeatures/Location/locationSlice";
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

const FlightSearch = () => {
  const dispatch = useDispatch();
  const { flights, from, to, loading, error, date } = useSelector(
    (state) => state.flight
  );
  const { searchResults } = useSelector((state) => state.locations);
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const query = activeField === "source" ? source : activeField === "destination" ? destination : "";
    if (query.trim().length >= 2) {
      setSearchLoading(true);
      const timer = window.setTimeout(() => {
        dispatch(searchLocations(query.trim())).finally(() => setSearchLoading(false));
        setShowSuggestions(true);
      }, 250);
      return () => window.clearTimeout(timer);
    }
    setShowSuggestions(false);
  }, [activeField, source, destination, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !selectedDate)
      return toast.info("Please fill all fields");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today)
      return toast.info("Please select today or a future date.");

    const formattedDate = selectedDate.toISOString().split("T")[0];
    dispatch(fetchFlightsBetweenAirports({ from: source, to: destination, date: formattedDate }));
  };

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative cursor-pointer w-full" onClick={onClick} ref={ref}>
      <Calendar size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
      <input
        value={value}
        readOnly
        required
        placeholder="Select date"
        className={inputCls + " cursor-pointer"}
      />
    </div>
  ));

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Search Flights</h1>
          <p className="text-sm text-stone-500 mt-1">Find the best flights for your journey.</p>
        </div>

        {/* Search card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="From">
                <div className="relative">
                  <PlaneTakeoff size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                  <input
                    type="text"
                    value={source}
                    required
                    onChange={(e) => {
                      setSource(e.target.value);
                      setActiveField("source");
                    }}
                    onFocus={() => setActiveField("source")}
                    placeholder="e.g. Mumbai"
                    className={inputCls}
                  />
                  {activeField === "source" && showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-orange-200 bg-white shadow-xl overflow-hidden">
                      {searchLoading ? (
                        <div className="p-3 text-sm text-stone-500">Searching locations…</div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.slice(0, 6).map((location) => (
                          <button
                            key={location._id}
                            type="button"
                            onClick={() => {
                              setSource(location.name);
                              setShowSuggestions(false);
                              setActiveField(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-stone-800 hover:bg-orange-50"
                          >
                            {location.name}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-stone-500">No locations found.</div>
                      )}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="To">
                <div className="relative">
                  <PlaneLanding size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400" />
                  <input
                    type="text"
                    value={destination}
                    required
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setActiveField("destination");
                    }}
                    onFocus={() => setActiveField("destination")}
                    placeholder="e.g. Delhi"
                    className={inputCls}
                  />
                  {activeField === "destination" && showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-orange-200 bg-white shadow-xl overflow-hidden">
                      {searchLoading ? (
                        <div className="p-3 text-sm text-stone-500">Searching locations…</div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.slice(0, 6).map((location) => (
                          <button
                            key={location._id}
                            type="button"
                            onClick={() => {
                              setDestination(location.name);
                              setShowSuggestions(false);
                              setActiveField(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-stone-800 hover:bg-orange-50"
                          >
                            {location.name}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-stone-500">No locations found.</div>
                      )}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Travel Date">
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  required
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                  customInput={<CustomDateInput />}
                />
              </Field>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              <Search size={16} strokeWidth={2} />
              Search Flights
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && <Loading message="Searching flights…" color="border-t-orange-500" />}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && flights?.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-stone-400">
              {flights.length} flight{flights.length !== 1 ? "s" : ""} found
            </p>

            {flights.map((flight, index) => (
              <div
                key={index}
                className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden hover:border-orange-300 hover:shadow-md transition-all"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <Plane size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{flight.airline}</p>
                      <p className="text-xs text-stone-400">{flight.flightNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
                    <IndianRupee size={16} strokeWidth={2.5} />
                    {flight.price.toLocaleString()}
                  </div>
                </div>

                {/* Route */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-5">
                    {/* Departure */}
                    <div>
                      <p className="text-xs text-stone-400 flex items-center gap-1 mb-1">
                        <PlaneTakeoff size={12} /> {flight.from}
                      </p>
                      <p className="text-2xl font-bold text-stone-800">{flight.departureTime}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex-1 flex flex-col items-center px-6">
                      <span className="text-xs text-stone-400 flex items-center gap-1 mb-2">
                        <Clock size={12} /> {flight.duration}
                      </span>
                      <div className="w-full relative flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-300 shrink-0" />
                        <div className="flex-1 h-px bg-orange-200 mx-1" />
                        <Plane size={14} className="text-orange-400 shrink-0" />
                        <div className="flex-1 h-px bg-orange-200 mx-1" />
                        <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <p className="text-xs text-stone-400 flex items-center justify-end gap-1 mb-1">
                        {flight.to} <PlaneLanding size={12} />
                      </p>
                      <p className="text-2xl font-bold text-stone-800">{flight.arrivalTime}</p>
                    </div>
                  </div>

                  {/* Book button */}
                  <button
                    onClick={() =>
                      navigate(`/flight-seat/${flight._id}`, {
                        state: { flight, journeyDate: date, source: from, destination: to },
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
                  >
                    <Armchair size={15} strokeWidth={2} />
                    Book Seats
                    <ArrowRight size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && flights?.length === 0 && from && to && (
          <div className="bg-white border border-orange-200 rounded-2xl p-12 text-center shadow-sm">
            <Plane size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-stone-500 font-medium mb-1">No flights found</p>
            <p className="text-stone-400 text-sm">
              No flights available from {from} to {to} on the selected date.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlightSearch;