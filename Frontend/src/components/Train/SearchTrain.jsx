import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchTrainsBetweenStations } from "../../../AllStatesFeatures/Train/AllTrainsSlice";
import { ArrowLeftRight, MapPin, Calendar, Search, Train, X } from "lucide-react";
import { LuxuryDatePicker } from "../General/LuxuryCalendar";

const inputCls =
  "w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

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
    if (!from || !to || !date) return toast.warn("All fields are required");
    if (from.toLowerCase() === to.toLowerCase())
      return toast.info("From and To cannot be the same");

    const payload = { from, to };
    if (date) {
      onDateChange(date);
      payload.day = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    }
    if (trainType) payload.trainType = trainType;
    dispatch(fetchTrainsBetweenStations(payload));
  };

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-stone-800">Search Trains</h2>
          <p className="text-sm text-stone-400 mt-1">Find trains between stations.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* From / Swap / To */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label="From">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className={inputCls}
                      required
                    />
                  </div>
                </Field>
              </div>

              {/* Swap */}
              <div className="mb-0.5 flex-shrink-0">
                {from && to ? (
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="border border-orange-200 hover:border-orange-400 hover:bg-orange-50 p-2.5 rounded-xl text-orange-500 transition-all active:scale-95"
                    title="Swap stations"
                  >
                    <ArrowLeftRight size={15} strokeWidth={2.5} />
                  </button>
                ) : (
                  <div className="w-10" />
                )}
              </div>

              <div className="flex-1">
                <Field label="To">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="e.g. Delhi"
                      className={inputCls}
                      required
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Train Type + Date */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Train Type">
                <div className="relative">
                  <Train size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-10" />
                  <select
                    value={trainType}
                    onChange={(e) => setTrainType(e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    <option value="">All types</option>
                    <option value="Express">Express</option>
                    <option value="Shatabdi">Shatabdi</option>
                    <option value="Superfast">Superfast</option>
                    <option value="Intercity">Intercity</option>
                    <option value="Mail">Mail</option>
                    <option value="Vande Bharat">Vande Bharat</option>
                    <option value="Rajdhani">Rajdhani</option>
                    <option value="Duronto">Duronto</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400"
                    width="10" height="6" viewBox="0 0 10 6" fill="none"
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </Field>

              <Field label="Travel Date">
                <LuxuryDatePicker value={date} onChange={setDate} placeholder="Select travel date" />
              </Field>
            </div>

            {/* Clear Date */}
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-400 transition-colors font-semibold"
              >
                <X size={12} strokeWidth={2.5} />
                Clear date
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide"
            >
              <Search size={16} strokeWidth={2.5} />
              Search Trains
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SearchTrain;
