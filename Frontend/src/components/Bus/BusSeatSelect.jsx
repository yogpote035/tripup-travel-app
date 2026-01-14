import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Armchair, 
  BedDouble, 
  Gauge, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  User,
  IndianRupee
} from "lucide-react";

const BusSeatSelect = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  
  useEffect(() => {
    setDisableButton(selectedSeats.length === 0);
  }, [selectedSeats]);

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
    <div className="max-w-6xl mx-auto mt-10 mb-5 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 mb-8">
        <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3 text-white mb-4">
          {bus.type === "sleeper" ? (
            <>
              <BedDouble size={32} className="text-orange-400" strokeWidth={2} />
              <span>Select Your Sleeper Berth</span>
            </>
          ) : (
            <>
              <Armchair size={32} className="text-blue-400" strokeWidth={2} />
              <span>Select Your Seat</span>
            </>
          )}
        </h2>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded border-2 border-gray-300"></div>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-600"></div>
            <span className="text-gray-300">Booked</span>
          </div>
        </div>
      </div>

      {/* Seater Layout */}
      {allSeater && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          {/* Driver Icon */}
          <div className="flex justify-end mb-4 pr-4">
            <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
              <Gauge size={20} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Driver</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Armchair size={24} className="text-blue-400" />
            <p className="text-lg font-semibold text-white">Seater Layout</p>
          </div>

          <div className="flex flex-col gap-4">
            {chunkArray(seats, 4).map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-5 gap-4 items-center justify-center"
              >
                {/* Right side - seats 1 & 2 */}
                {row.slice(0, 2).map((seat) => (
                  <button
                    key={seat.seatNumber}
                    className={`relative w-14 h-14 rounded-lg font-medium border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                      seat.isBooked
                        ? "bg-red-500 text-white cursor-not-allowed border-red-600"
                        : selectedSeats.includes(seat.seatNumber)
                        ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                        : "bg-white text-gray-800 hover:bg-blue-100 border-gray-300 hover:border-blue-400"
                    }`}
                    disabled={seat.isBooked}
                    onClick={() => toggleSeat(seat.seatNumber)}
                  >
                    <Armchair size={20} strokeWidth={2} />
                    <span className="text-xs font-bold mt-1">{seat.seatNumber}</span>
                  </button>
                ))}

                {/* Gap */}
                <div className="flex items-center justify-center">
                  <div className="h-12 w-0.5 bg-gray-600"></div>
                </div>

                {/* Left side - seats 3 & 4 */}
                {row.slice(2, 4).map((seat) => (
                  <button
                    key={seat.seatNumber}
                    className={`relative w-14 h-14 rounded-lg font-medium border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                      seat.isBooked
                        ? "bg-red-500 text-white cursor-not-allowed border-red-600"
                        : selectedSeats.includes(seat.seatNumber)
                        ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                        : "bg-white text-gray-800 hover:bg-blue-100 border-gray-300 hover:border-blue-400"
                    }`}
                    disabled={seat.isBooked}
                    onClick={() => toggleSeat(seat.seatNumber)}
                  >
                    <Armchair size={20} strokeWidth={2} />
                    <span className="text-xs font-bold mt-1">{seat.seatNumber}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleeper Layout */}
      {allSleeper && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Lower Deck */}
          <div className="bg-gray-800 border-2 border-gray-700 hover:border-orange-400 rounded-2xl p-6 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BedDouble size={24} className="text-orange-400" />
              <p className="text-lg font-semibold text-white">Lower Deck</p>
            </div>
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
                        <div className="text-xs font-medium mb-1 text-gray-400">
                          #{row[2].seatNumber}
                        </div>
                        <button
                          className={`w-12 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            row[2].isBooked
                              ? "bg-red-500 text-white border-red-600 cursor-not-allowed"
                              : selectedSeats.includes(row[2].seatNumber)
                              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                              : "bg-white text-gray-800 border-gray-300 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                          disabled={row[2].isBooked}
                          onClick={() => toggleSeat(row[2].seatNumber)}
                        >
                          <User size={24} strokeWidth={2} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {row[2].isBooked ? (
                            <span className="text-red-400">Sold</span>
                          ) : (
                            <>
                              <IndianRupee size={10} />
                              <span>{bus.fare}</span>
                            </>
                          )}
                        </div>
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
                        <div className="text-xs font-medium mb-1 text-gray-400">
                          #{seat.seatNumber}
                        </div>
                        <button
                          className={`w-12 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            seat.isBooked
                              ? "bg-red-500 text-white border-red-600 cursor-not-allowed"
                              : selectedSeats.includes(seat.seatNumber)
                              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                              : "bg-white text-gray-800 border-gray-300 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.seatNumber)}
                        >
                          <User size={24} strokeWidth={2} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {seat.isBooked ? (
                            <span className="text-red-400">Sold</span>
                          ) : (
                            <>
                              <IndianRupee size={10} />
                              <span>{bus.fare}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upper Deck */}
          <div className="bg-gray-800 border-2 border-gray-700 hover:border-orange-400 rounded-2xl p-6 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BedDouble size={24} className="text-orange-400" />
              <p className="text-lg font-semibold text-white">Upper Deck</p>
            </div>
            <div className="flex flex-col gap-4">
              {chunkArray(upperDeck, 3).map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-3 gap-4 items-start justify-center"
                >
                  <div className="flex justify-center">
                    {row[2] && (
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-medium mb-1 text-gray-400">
                          #{row[2].seatNumber}
                        </div>
                        <button
                          className={`w-12 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            row[2].isBooked
                              ? "bg-red-500 text-white border-red-600 cursor-not-allowed"
                              : selectedSeats.includes(row[2].seatNumber)
                              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                              : "bg-white text-gray-800 border-gray-300 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                          disabled={row[2].isBooked}
                          onClick={() => toggleSeat(row[2].seatNumber)}
                        >
                          <User size={24} strokeWidth={2} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {row[2].isBooked ? (
                            <span className="text-red-400">Sold</span>
                          ) : (
                            <>
                              <IndianRupee size={10} />
                              <span>{bus.fare}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 flex gap-4 justify-center">
                    {row.slice(0, 2).map((seat) => (
                      <div
                        key={seat.seatNumber}
                        className="flex flex-col items-center"
                      >
                        <div className="text-xs font-medium mb-1 text-gray-400">
                          #{seat.seatNumber}
                        </div>
                        <button
                          className={`w-12 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            seat.isBooked
                              ? "bg-red-500 text-white border-red-600 cursor-not-allowed"
                              : selectedSeats.includes(seat.seatNumber)
                              ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                              : "bg-white text-gray-800 border-gray-300 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.seatNumber)}
                        >
                          <User size={24} strokeWidth={2} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {seat.isBooked ? (
                            <span className="text-red-400">Sold</span>
                          ) : (
                            <>
                              <IndianRupee size={10} />
                              <span>{bus.fare}</span>
                            </>
                          )}
                        </div>
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-center gap-3 text-red-400 font-semibold mb-6">
          <AlertTriangle size={24} />
          <span>Mixed seat types are currently not supported.</span>
        </div>
      )}

      {/* Confirm Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleConfirm}
          disabled={disableButton}
          className={`${
            !disableButton
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-gray-600 cursor-not-allowed opacity-50"
          } text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-2`}
        >
          {disableButton ? (
            <>
              <XCircle size={20} />
              Select at least one seat
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Confirm Selection ({selectedSeats.length} seat
              {selectedSeats.length > 1 ? "s" : ""})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BusSeatSelect;