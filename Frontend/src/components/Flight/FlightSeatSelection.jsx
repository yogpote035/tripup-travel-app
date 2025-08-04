import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { MdAirlineSeatReclineExtra } from "react-icons/md";
import { toast } from "react-toastify";

const FlightSeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { flight, journeyDate, source, destination } = state;
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (seatNumber, isBooked) => {
    if (isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat.");
      return;
    }
    navigate("/flight-seat-book", {
      state: {
        flight,
        seats: selectedSeats,
        journeyDate,
        source,
        destination,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 mt-10 mb-10 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          ✈️ Select Your Seat
        </h2>

        {/* Seat Legend */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <MdAirlineSeatReclineExtra className="text-green-400" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <MdAirlineSeatReclineExtra className="text-red-500" />
            Booked
          </div>
          <div className="flex items-center gap-2">
            <MdAirlineSeatReclineExtra className="text-yellow-300" />
            Selected
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-4 gap-4">
          {flight.seats.map((seat, idx) => {
            const isSelected = selectedSeats.includes(seat.seatNumber);
            return (
              <button
                key={idx}
                onClick={() => handleSeatClick(seat.seatNumber, seat.isBooked)}
                disabled={seat.isBooked}
                className={`p-4 rounded-lg text-xl flex items-center justify-center border
                  ${seat.isBooked ? "bg-red-600 cursor-not-allowed" : ""}
                  ${isSelected ? "bg-yellow-400 text-black" : ""}
                  ${
                    !seat.isBooked && !isSelected
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }`}
              >
                <MdAirlineSeatReclineExtra />
                <span className="ml-2 text-sm">{seat.seatNumber}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleBooking}
          className="mt-6 bg-yellow-500 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-600"
        >
          🧾 Book Selected Seats ({selectedSeats.length})
        </button>
      </div>
    </div>
  );
};

export default FlightSeatSelection;
