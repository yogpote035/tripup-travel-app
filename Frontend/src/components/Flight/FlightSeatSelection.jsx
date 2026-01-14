import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Armchair, 
  Plane,
  CheckCircle2,
  XCircle,
  User
} from "lucide-react";

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

  // Group seats into rows (assuming 6 seats per row: A-F)
  const seatsPerRow = 6;
  const rows = [];
  for (let i = 0; i < flight.seats.length; i += seatsPerRow) {
    rows.push(flight.seats.slice(i, i + seatsPerRow));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3 text-white mb-4">
            <Plane size={32} className="text-purple-400" strokeWidth={2} />
            <span>Select Your Seat</span>
          </h2>
          
          {/* Flight Info */}
          <div className="text-center text-gray-400 text-sm">
            <p>{flight.airline} - {flight.flightNumber}</p>
            <p>{source} → {destination}</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                <Armchair size={16} className="text-gray-800" />
              </div>
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg border-2 border-purple-600 flex items-center justify-center shadow-lg">
                <Armchair size={16} className="text-white" />
              </div>
              <span className="text-gray-300">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg border-2 border-red-600 flex items-center justify-center">
                <Armchair size={16} className="text-white" />
              </div>
              <span className="text-gray-300">Booked</span>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-xl">
          {/* Cockpit */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 px-6 py-3 rounded-full border border-purple-500/30">
              <Plane size={20} className="text-purple-400" />
              <span className="text-purple-300 font-semibold">Cockpit</span>
            </div>
          </div>

          {/* Seats Grid */}
          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-3">
                {/* Row Number */}
                <div className="w-8 text-center text-gray-500 text-sm font-semibold">
                  {rowIndex + 1}
                </div>

                {/* Left Side (ABC) */}
                <div className="flex gap-2">
                  {row.slice(0, 3).map((seat, seatIndex) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seatIndex}
                        onClick={() => handleSeatClick(seat.seatNumber, seat.isBooked)}
                        disabled={seat.isBooked}
                        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                          seat.isBooked
                            ? "bg-red-500 border-red-600 cursor-not-allowed"
                            : isSelected
                            ? "bg-purple-500 border-purple-600 shadow-lg scale-105"
                            : "bg-white border-gray-300 hover:bg-purple-100 hover:border-purple-400"
                        }`}
                      >
                        <Armchair 
                          size={20} 
                          strokeWidth={2}
                          className={seat.isBooked || isSelected ? "text-white" : "text-gray-800"}
                        />
                        <span className={`text-xs font-bold mt-1 ${seat.isBooked || isSelected ? "text-white" : "text-gray-800"}`}>
                          {seat.seatNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-12 flex items-center justify-center">
                  <div className="h-12 w-1 bg-gray-700 rounded-full"></div>
                </div>

                {/* Right Side (DEF) */}
                <div className="flex gap-2">
                  {row.slice(3, 6).map((seat, seatIndex) => {
                    if (!seat) return null;
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seatIndex}
                        onClick={() => handleSeatClick(seat.seatNumber, seat.isBooked)}
                        disabled={seat.isBooked}
                        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                          seat.isBooked
                            ? "bg-red-500 border-red-600 cursor-not-allowed"
                            : isSelected
                            ? "bg-purple-500 border-purple-600 shadow-lg scale-105"
                            : "bg-white border-gray-300 hover:bg-purple-100 hover:border-purple-400"
                        }`}
                      >
                        <Armchair 
                          size={20} 
                          strokeWidth={2}
                          className={seat.isBooked || isSelected ? "text-white" : "text-gray-800"}
                        />
                        <span className={`text-xs font-bold mt-1 ${seat.isBooked || isSelected ? "text-white" : "text-gray-800"}`}>
                          {seat.seatNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Row Number (Right) */}
                <div className="w-8 text-center text-gray-500 text-sm font-semibold">
                  {rowIndex + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`${
              selectedSeats.length === 0
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
            } text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-2`}
          >
            {selectedSeats.length === 0 ? (
              <>
                <XCircle size={20} />
                Select at least one seat
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Book Selected Seats ({selectedSeats.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightSeatSelection;