import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlightsBetweenAirports } from "../../../AllStatesFeatures/Flight/AllFlightSlice";
import Loading from "../../General/Loading";
import { MdFlightTakeoff, MdFlightLand, MdCalendarToday } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
    today.setHours(0, 0, 0, 0); // reset time to midnight for accurate comparison

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
    (
      { value, onClick },
      ref //special function bcz icon is not render,date picker only render date
    ) => (
      <div
        className="relative cursor-pointer w-full"
        onClick={onClick}
        ref={ref}
      >
        <FaCalendarAlt className="absolute top-3 left-3 text-gray-400" />
        <input
          value={value}
          required
          onChange={() => {}}
          placeholder="Select travel date"
          readOnly
          className="pl-10 w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
    )
  );

  return (
    <div className="min-h-screen mt-10 bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
          <MdFlightTakeoff className="text-3xl" />
          Search Flights
        </h2>

        {/* 🔎 Form Section */}
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="relative">
            <MdFlightTakeoff className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              value={source}
              required
              onChange={(e) => setSource(e.target.value)}
              placeholder="From (e.g. Mumbai)"
              className="pl-10 w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="relative">
            <MdFlightLand className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="To (e.g. Delhi)"
              className="pl-10 w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* <div className="relative"> */}
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            required
            dateFormat="yyyy-MM-dd"
            placeholderText="Select travel date"
            customInput={<CustomDateInput />} //bcz icon is not render like other
          />
          {/* </div> */}

          <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-2 w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded"
            >
              🔍 Search Flights
            </button>
          </div>
        </form>

        {loading && <Loading message="Fetching flights..." />}

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {!loading && flights?.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Available Flights
            </h3>
            {flights.map((flight, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-md p-4 border border-gray-600 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">{flight.airline}</h4>
                    <p className="text-sm text-gray-300">
                      {flight.flightNumber}
                    </p>
                    <p className="text-sm mt-1">
                      {flight.from} ➝ {flight.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-400">
                      ₹{flight.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">{flight.duration}</p>
                    <p className="text-sm text-gray-400">
                      {flight.departureTime} - {flight.arrivalTime}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                  >
                    Book Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🛑 No Flights Found */}
        {!loading && flights?.length === 0 && from && to && (
          <p className="text-gray-400 mt-4">
            No flights found from {from} to {to}.
          </p>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
