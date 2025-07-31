import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBusesBetweenStations } from "../../../AllStatesFeatures/Bus/AllBusSlice";
import { toast } from "react-toastify";
import { BsFillBusFrontFill } from "react-icons/bs";

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
      className="bg-gray-800 p-6 rounded-2xl mt-10 shadow-lg max-w-2xl mx-auto text-white"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
        <BsFillBusFrontFill />
        <span>Search Buses</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          className="bg-gray-700 text-white border border-gray-600 p-3 rounded-lg placeholder-gray-400 focus:outline-none outline-none"
        />
        <input
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="bg-gray-700 text-white border border-gray-600 p-3 rounded-lg placeholder-gray-400 focus:outline-none outline-none"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:outline-none outline-none"
        />
      </div>

      <button
        type="submit"
        className={`w-full mt-6 py-3 text-lg font-medium rounded-lg transition duration-200 ${
          loading
            ? "bg-blue-500 opacity-50 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {error && (
        <p className="text-red-400 text-sm mt-3 text-center">⚠️ {error}</p>
      )}
    </form>
  );
};

export default BusSearch;
