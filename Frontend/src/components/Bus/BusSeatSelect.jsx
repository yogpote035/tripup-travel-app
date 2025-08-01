import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BusSeatSelect = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { seats = [], bus } = state;

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat.");
      return;
    }

    const selectedSeatObjects = seats.filter((seat) =>
      selectedSeats.includes(seat.seatNumber)
    );

    navigate("/bus-seat-book", {
      state: {
        selectedSeats: selectedSeatObjects,
        bus,
      },
    });
  };

  const allSeater = seats.every((s) => s.seatType === "Seater");
  const allSleeper = seats.every((s) => s.seatType === "Sleeper");

  const upperDeck = allSleeper
    ? seats.filter((seat) => seat.seatNumber % 2 === 0)
    : [];
  const lowerDeck = allSleeper
    ? seats.filter((seat) => seat.seatNumber % 2 !== 0)
    : [];

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🪑 Select Your Seats
      </h2>

      {/* Seater Layout */}
      {allSeater && (
        <>
          <p className="text-lg font-semibold mb-3">🪑 Seater Layout</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {seats.map((seat) => (
              <button
                key={seat.seatNumber}
                className={`py-2 px-3 rounded-md font-medium border text-sm transition-all duration-150 ${
                  seat.isBooked
                    ? "bg-red-500 text-white cursor-not-allowed border-gray-500"
                    : selectedSeats.includes(seat.seatNumber)
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-200 text-black hover:bg-blue-300 border-gray-400"
                }`}
                disabled={seat.isBooked}
                onClick={() => toggleSeat(seat.seatNumber)}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Sleeper Layout */}
      {allSleeper && (
        <>
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">🛏️ Lower Deck (Sleeper)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lowerDeck.map((seat) => (
                <button
                  key={seat.seatNumber}
                  className={`py-2 px-3 rounded-md font-medium border text-sm transition-all duration-150 ${
                    seat.isBooked
                      ? "bg-red-500 text-white cursor-not-allowed border-gray-500"
                      : selectedSeats.includes(seat.seatNumber)
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-yellow-200 text-black hover:bg-yellow-300 border-yellow-400"
                  }`}
                  disabled={seat.isBooked}
                  onClick={() => toggleSeat(seat.seatNumber)}
                >
                  #{seat.seatNumber}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold mb-2">🛏️ Upper Deck (Sleeper)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {upperDeck.map((seat) => (
                <button
                  key={seat.seatNumber}
                  className={`py-2 px-3 rounded-md font-medium border text-sm transition-all duration-150 ${
                    seat.isBooked
                      ? "bg-red-500 text-white cursor-not-allowed border-gray-500"
                      : selectedSeats.includes(seat.seatNumber)
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-yellow-100 text-black hover:bg-yellow-200 border-yellow-300"
                  }`}
                  disabled={seat.isBooked}
                  onClick={() => toggleSeat(seat.seatNumber)}
                >
                  #{seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mixed Layout Warning */}
      {!allSeater && !allSleeper && (
        <div className="text-center mt-6 text-red-500 font-semibold">
          ⚠️ Mixed seat types are currently not supported.
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={handleConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition duration-300"
        >
          Confirm Selection ({selectedSeats.length} seat
          {selectedSeats.length > 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
};

export default BusSeatSelect;
