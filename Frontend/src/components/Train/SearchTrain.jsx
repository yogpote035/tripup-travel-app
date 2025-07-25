import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchTrainsBetweenStations } from "../../../AllStatesFeatures/Train/trainSlice";

const SearchTrain = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from || !to) {
      toast.warn("Please select both stations.");
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      toast.info("Source and destination can't be the same.");
      return;
    }

    dispatch(fetchTrainsBetweenStations({ from, to }));
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-400">
        Search Trains
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="from" className="block mb-1 font-medium text-gray-300">
            From
          </label>
          <input
            id="from"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Enter departure station"
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="to" className="block mb-1 font-medium text-gray-300">
            To
          </label>
          <input
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Enter arrival station"
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          Find Trains
        </button>
      </form>
    </div>
  );
};

export default SearchTrain;
