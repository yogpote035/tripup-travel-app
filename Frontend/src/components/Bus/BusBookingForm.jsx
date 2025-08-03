import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { bookBusSeats } from "../../../AllStatesFeatures/Bus/BookBusTicketSlice";
import Loading from "../../General/Loading";

const BusBookingForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSeats, bus } = state;

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatNumber: seat.seatNumber,
      name: "",
      gender: "",
      email: "",
      phone: "",
    }))
  );

  const loading = useSelector((state) => state.BookBusTicket.loading);
  if (loading) return <Loading message="Wait!,Your Journey is Loading...." />;

  const updateField = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = async () => {
    const isIncomplete = passengers.some(
      (p) => !p.name || !p.gender || !p.email || !p.phone
    );

    if (isIncomplete) {
      toast.warning("Please complete all passenger details.");
      return;
    }
    console.log(passengers);
    const bookingPayload = {
      busNumber: bus.busNumber,
      journeyDate: bus.journeyDate,
      source: bus.source,
      destination: bus.destination,
      passengers: passengers,
    };
    dispatch(bookBusSeats(bookingPayload, navigate));
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 mb-15 p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-white">
        🧾 Passenger Information
      </h2>

      {passengers.map((passenger, index) => (
        <div
          key={index}
          className="bg-gray-700 p-4 mb-4 rounded-lg border border-gray-600"
        >
          <p className="font-semibold text-white mb-2">
            Seat Number:{" "}
            <span className="text-blue-400">{passenger.seatNumber}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={passenger.name}
              onChange={(e) => updateField(index, "name", e.target.value)}
              className="p-2 border border-gray-600 rounded w-full bg-gray-900 outline-none focus:outline-none text-white placeholder-gray-400"
              required
            />
            <select
              value={passenger.gender}
              onChange={(e) => updateField(index, "gender", e.target.value)}
              className="p-2 border border-gray-600 rounded w-full bg-gray-900 outline-none focus:outline-none text-white"
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              value={passenger.email}
              onChange={(e) => updateField(index, "email", e.target.value)}
              className="p-2 border border-gray-600 rounded w-full bg-gray-900 outline-none focus:outline-none text-white placeholder-gray-400"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={passenger.phone}
              onChange={(e) => updateField(index, "phone", e.target.value)}
              className="p-2 border border-gray-600 rounded w-full bg-gray-900 outline-none focus:outline-none text-white placeholder-gray-400"
              required
            />
          </div>
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition duration-300"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BusBookingForm;
