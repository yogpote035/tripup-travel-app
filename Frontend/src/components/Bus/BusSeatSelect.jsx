import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiSteering2Line } from "react-icons/ri";
import { MdOutlineAirlineSeatReclineNormal } from "react-icons/md";
import { MdAirlineSeatFlat, MdAirlineSeatReclineNormal } from "react-icons/md";
import { FaSquarePersonConfined, FaPersonThroughWindow } from "react-icons/fa6";

const BusSeatSelect = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setDisableButton(true);
    } else {
      setDisableButton(false);
    }
  });
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

  const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked;
  };

  const allSeater = seats.every((s) => s.seatType === "seater");
  const allSleeper = seats.every((s) => s.seatType === "sleeper");

  const upperDeck = allSleeper
    ? seats.filter((seat) => seat.seatNumber % 2 === 0)
    : [];
  const lowerDeck = allSleeper
    ? seats.filter((seat) => seat.seatNumber % 2 !== 0)
    : [];

  return (
    <div className="max-w-5xl mx-auto mt-10 mb-5 px-4 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        {bus.type === "sleeper" ? (
          <>
            <MdAirlineSeatFlat className="text-3xl text-orange-500" />
            <span>Select Your Sleeper Berth</span>
          </>
        ) : (
          <>
            <MdAirlineSeatReclineNormal className="text-3xl text-blue-600" />
            <span>Select Your Seat</span>
          </>
        )}
      </h2>

      {allSeater && (
        <>
          {/* Driver Icon */}
          <div className="flex justify-end mb-2 pr-4">
            <p className="text-sm font-semibold flex items-center gap-1">
              Driver <RiSteering2Line className="text-xl" />
            </p>
          </div>

          <p className="text-lg font-semibold mb-3">🪑 Seater Layout</p>

          <div className="flex flex-col gap-4 mb-6">
            {chunkArray(seats, 4).map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-5 gap-4 items-center justify-center"
              >
                {/* Right side - seats 1 & 2 (no reverse) */}
                {row.slice(0, 2).map((seat) => (
                  <button
                    key={seat.seatNumber}
                    className={`w-10 h-10 text-xs rounded-md font-medium border transition-all duration-150 ${
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
                    <MdOutlineAirlineSeatReclineNormal fontSize={25} />
                  </button>
                ))}

                {/* Gap */}
                <div></div>

                {/* Left side - seats 3 & 4 (no reverse) */}
                {row.slice(2, 4).map((seat) => (
                  <button
                    key={seat.seatNumber}
                    className={`w-10 h-10 text-xs rounded-md font-medium border transition-all duration-150 ${
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
                    <MdOutlineAirlineSeatReclineNormal fontSize={25} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sleeper Layout */}
      {allSleeper && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Lower Deck */}
          <div className="border rounded-md hover:border-orange-400 p-2">
            <p className="text-lg font-semibold mb-3 text-center">
              🛏️ Lower Deck
            </p>
            <div className="flex flex-col gap-4">
              {chunkArray(lowerDeck, 3).map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-3 gap-4 items-start justify-center"
                >
                  {/* Right (1 sleeper bed) */}
                  <div className="flex justify-center">
                    {row[2] && (
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-medium mb-1">
                          #{row[2].seatNumber}
                        </div>
                        <button
                          className={`w-10 h-16 rounded-md border-2 text-xl flex items-center justify-center ${
                            row[2].isBooked
                              ? "bg-gray-300 text-gray-400 border-gray-400 cursor-not-allowed"
                              : selectedSeats.includes(row[2].seatNumber)
                              ? "bg-green-400 text-white border-green-500"
                              : "bg-white text-black border-gray-300 hover:bg-blue-100"
                          }`}
                          disabled={row[2].isBooked}
                          onClick={() => toggleSeat(row[2].seatNumber)}
                        >
                          <FaPersonThroughWindow />
                        </button>
                        <span className="text-xs text-gray-500 mt-1">
                          {row[2].isBooked ? "Sold" : `₹${bus.fare}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Left (2 sleeper beds) */}
                  <div className="col-span-2 flex gap-4 justify-center">
                    {row.slice(0, 2).map((seat) => (
                      <div
                        key={seat.seatNumber}
                        className="flex flex-col items-center"
                      >
                        <div className="text-xs font-medium mb-1">
                          #{seat.seatNumber}
                        </div>
                        <button
                          className={`w-10 h-16 rounded-md border-2 text-xl flex items-center justify-center ${
                            seat.isBooked
                              ? "bg-gray-300 text-gray-400 border-gray-400 cursor-not-allowed"
                              : selectedSeats.includes(seat.seatNumber)
                              ? "bg-green-400 text-white border-green-500"
                              : "bg-white text-black border-gray-300 hover:bg-blue-100"
                          }`}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.seatNumber)}
                        >
                          <FaPersonThroughWindow />
                        </button>
                        <span className="text-xs text-gray-500 mt-1">
                          {seat.isBooked ? "Sold" : `₹${bus.fare}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upper Deck – Same as lower */}
          <div className="border rounded-md hover:border-orange-400 p-2">
            <p className="text-lg font-semibold mb-3 text-center">
              🛏️ Upper Deck
            </p>
            <div className="flex flex-col gap-4">
              {chunkArray(upperDeck, 3).map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-3 gap-4 items-start justify-center"
                >
                  {/* Right (1 sleeper bed) */}
                  <div className="flex justify-center">
                    {row[2] && (
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-medium mb-1">
                          #{row[2].seatNumber}
                        </div>
                        <button
                          className={`w-10 h-16 rounded-md border-2 text-xl flex items-center justify-center ${
                            row[2].isBooked
                              ? "bg-gray-300 text-gray-400 border-gray-400 cursor-not-allowed"
                              : selectedSeats.includes(row[2].seatNumber)
                              ? "bg-green-400 text-white border-green-500"
                              : "bg-white text-black border-gray-300 hover:bg-blue-100"
                          }`}
                          disabled={row[2].isBooked}
                          onClick={() => toggleSeat(row[2].seatNumber)}
                        >
                          <FaPersonThroughWindow />
                        </button>
                        <span className="text-xs text-gray-500 mt-1">
                          {row[2].isBooked ? "Sold" : `₹${bus.fare}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Left (2 sleeper beds) */}
                  <div className="col-span-2 flex gap-4 justify-center">
                    {row.slice(0, 2).map((seat) => (
                      <div
                        key={seat.seatNumber}
                        className="flex flex-col items-center"
                      >
                        <div className="text-xs font-medium mb-1">
                          #{seat.seatNumber}
                        </div>
                        <button
                          className={`w-10 h-16 rounded-md border-2 text-xl flex items-center justify-center ${
                            seat.isBooked
                              ? "bg-gray-300 text-gray-400 border-gray-400 cursor-not-allowed"
                              : selectedSeats.includes(seat.seatNumber)
                              ? "bg-green-400 text-white border-green-500"
                              : "bg-white text-black border-gray-300 hover:bg-blue-100"
                          }`}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.seatNumber)}
                        >
                          <FaPersonThroughWindow />
                        </button>
                        <span className="text-xs text-gray-500 mt-1">
                          {seat.isBooked ? "Sold" : `₹${bus.fare}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          disabled={disableButton}
          className={`${
            !disableButton
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-rose-600 hover:cursor-not-allowed"
          } text-white font-medium px-6 py-2 rounded-lg transition duration-300`}
        >
          Confirm Selection ({selectedSeats.length} seat
          {selectedSeats.length > 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
};

export default BusSeatSelect;
