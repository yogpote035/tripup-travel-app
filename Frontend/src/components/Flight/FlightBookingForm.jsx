import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { bookFlightSeat } from "../../../AllStatesFeatures/Flight/BookFlightSeatSlice";
import { FaUser, FaPhone, FaEnvelope, FaVenusMars } from "react-icons/fa";
import { MdAirlineSeatReclineExtra } from "react-icons/md";

import { toast } from "react-toastify";
import Loading from "../../General/Loading";

const FlightBookingForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.BookFlightTicket.loading);

  const {
    flight,
    journeyDate,
    source: from,
    destination: to,
    seats,
  } = state || {};

  const [passengers, setPassengers] = useState(
    seats?.map((seat) => ({
      name: "",
      gender: "",
      seatNumber: seat || "",
      email: "",
      phone: "",
    })) || []
  );

  const handleChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const p of passengers) {
      if (!p.name || !p.gender || !p.seatNumber || !p.email || !p.phone) {
        return toast.info("Please fill all fields for each passenger");
      }
    }

    const bookingData = {
      flightId: flight?._id,
      journeyDate,
      from,
      to,
      passengers,
    };

    dispatch(bookFlightSeat(bookingData, navigate));
  };

  if (!state) {
    return (
      <div className="text-white p-6">
        Invalid flight selection. Please go back and select a flight.
      </div>
    );
  }

  if (loading) return <Loading message="Wait!,Your Journey is Loading...." />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 mt-10">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">
          ✈️ Passenger Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {passengers.map((p, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-700 p-4 rounded"
            >
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Passenger Name"
                  value={p.name}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                  className="pl-10 p-2 w-full rounded bg-gray-800 placeholder-gray-400 outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FaVenusMars className="absolute top-3 left-3 text-gray-400" />
                <select
                  value={p.gender}
                  onChange={(e) => handleChange(idx, "gender", e.target.value)}
                  className="pl-10 p-2 w-full rounded bg-gray-800 text-white outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="relative flex items-center bg-gray-800 px-4 py-2 rounded">
                <MdAirlineSeatReclineExtra className="mr-2 text-gray-400" />
                <span className="text-sm font-semibold">
                  Seat: {p.seatNumber}
                </span>
              </div>

              <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
                <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={p.email}
                  onChange={(e) => handleChange(idx, "email", e.target.value)}
                  className="pl-10 p-2 w-full rounded bg-gray-800 placeholder-gray-400 outline-none"
                  required
                />
              </div>

              <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
                <FaPhone className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={p.phone}
                  onChange={(e) => handleChange(idx, "phone", e.target.value)}
                  className="pl-10 p-2 w-full rounded bg-gray-800 placeholder-gray-400 outline-none"
                  required
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={passengers.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded w-full md:w-auto"
          >
            ✅ Confirm Booking ({passengers.length} Seat
            {passengers.length > 1 ? "s" : ""})
          </button>
        </form>
      </div>
    </div>
  );
};

export default FlightBookingForm;
