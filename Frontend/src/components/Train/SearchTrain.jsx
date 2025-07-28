import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchTrainsBetweenStations } from "../../../AllStatesFeatures/Train/AllTrainsSlice";
import { MdSwapVerticalCircle } from "react-icons/md";

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
      onDateChange(date); //pass to TrainList
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
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 text-white max-w-xl mx-auto p-4 rounded-xl shadow-lg space-y-6"
    >
      <h2 className="text-2xl font-bold text-blue-400 text-center">
        Search Trains
      </h2>

      {/* From */}
      <div>
        <label className="block mb-1 text-white font-medium">From</label>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Enter departure station"
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none  focus:ring-blue-500"
          required
        />
      </div>

      {/* Swap Button */}
      {from && to && (
        <div className="text-center mt-0 mb-0">
          <button
            type="button"
            onClick={handleSwap}
            className="text-white hover:text-gray-400 text-3xl"
          >
            <MdSwapVerticalCircle />
          </button>
        </div>
      )}

      {/* To */}
      <div>
        <label className="block mb-1 text-white font-medium">To</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Enter destination station"
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none  focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-white font-medium">
          Train Type (Optional)
        </label>
        <select
          value={trainType}
          onChange={(e) => setTrainType(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none  focus:ring-blue-500"
        >
          <option value="">-- All Types --</option>
          <option value="Express">Express</option>
          <option value="Shatabdi">Shatabdi</option>
          <option value="Superfast">Superfast</option>
          <option value="Intercity">Intercity</option>
          <option value="Mail">Mail</option>
          <option value="Vande Bharat">Vande Bharat</option>
          <option value="Rajdhani">Rajdhani</option>
          <option value="Duronto">Duronto</option>
        </select>
      </div>

      {/* Date Picker + Clear */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full">
          <label className="block mb-1 text-white font-medium">
            Date of Journey (Optional)
          </label>
          <input
            type="date"
            value={date}
            required
            placeholder="All Dates"
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none  focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-[40%] mt-1 sm:mt-6">
          <button
            type="button"
            onClick={() => setDate("")}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            Clear Date
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-white hover:bg-gray-200 outline-none focus:outline-none text-black font-semibold rounded-md transition"
      >
        Find Trains
      </button>
    </form>
  );
};

export default SearchTrain;
