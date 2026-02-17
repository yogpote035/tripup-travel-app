import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Armchair, Plane, CheckCircle2, XCircle } from "lucide-react";

const FlightSeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { flight, journeyDate, source, destination } = state;
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (seatNumber, isBooked) => {
    if (isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat.");
      return;
    }
    navigate("/flight-seat-book", {
      state: { flight, seats: selectedSeats, journeyDate, source, destination },
    });
  };

  const seatsPerRow = 6;
  const rows = [];
  for (let i = 0; i < flight.seats.length; i += seatsPerRow) {
    rows.push(flight.seats.slice(i, i + seatsPerRow));
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Select a seat</h1>
          <p className="text-sm text-stone-500 mt-1">
            {flight.airline} · {flight.flightNumber} &nbsp;·&nbsp; {source} → {destination}
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white border border-orange-200 rounded-2xl px-6 py-4 shadow-sm flex flex-wrap gap-5">
          {[
            { label: "Available", bg: "bg-white border-orange-200", icon: "text-stone-500" },
            { label: "Selected",  bg: "bg-orange-500 border-orange-500", icon: "text-white" },
            { label: "Booked",   bg: "bg-stone-200 border-stone-300", icon: "text-stone-400" },
          ].map(({ label, bg, icon }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg border-2 ${bg} flex items-center justify-center`}>
                <Armchair size={15} className={icon} strokeWidth={2} />
              </div>
              <span className="text-sm text-stone-500 font-medium">{label}</span>
            </div>
          ))}

          {selectedSeats.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-stone-400">Selected</span>
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedSeats.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Seat map card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Cockpit nose */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-5 py-2 rounded-full">
              <Plane size={15} className="text-orange-400" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-widest uppercase text-stone-500">Cockpit</span>
            </div>
          </div>

          {/* Column labels */}
          <div className="flex items-center justify-center gap-3 px-8 py-2">
            <div className="w-6" />
            <div className="flex gap-2">
              {["A","B","C"].map(l => (
                <div key={l} className="w-11 text-center text-xs font-bold tracking-widest uppercase text-stone-400">{l}</div>
              ))}
            </div>
            <div className="w-10" />
            <div className="flex gap-2">
              {["D","E","F"].map(l => (
                <div key={l} className="w-11 text-center text-xs font-bold tracking-widest uppercase text-stone-400">{l}</div>
              ))}
            </div>
            <div className="w-6" />
          </div>

          {/* Rows */}
          <div className="px-8 pb-8 pt-1 space-y-2">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-3">
                {/* Row number left */}
                <div className="w-6 text-center text-xs font-semibold text-stone-400">
                  {rowIndex + 1}
                </div>

                {/* Left group A-B-C */}
                <div className="flex gap-2">
                  {row.slice(0, 3).map((seat, i) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={i}
                        onClick={() => handleSeatClick(seat.seatNumber, seat.isBooked)}
                        disabled={seat.isBooked}
                        title={seat.seatNumber}
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-150 ${
                          seat.isBooked
                            ? "bg-stone-100 border-stone-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-orange-500 border-orange-500 shadow-md scale-105"
                            : "bg-white border-orange-200 hover:border-orange-400 hover:bg-orange-50 active:scale-95"
                        }`}
                      >
                        <Armchair
                          size={14}
                          strokeWidth={2}
                          className={
                            seat.isBooked
                              ? "text-stone-300"
                              : isSelected
                              ? "text-white"
                              : "text-stone-500"
                          }
                        />
                        <span className={`text-[10px] font-bold leading-none mt-0.5 ${
                          seat.isBooked ? "text-stone-300" : isSelected ? "text-white" : "text-stone-500"
                        }`}>
                          {seat.seatNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-10 flex justify-center">
                  <div className="h-8 w-px bg-orange-100" />
                </div>

                {/* Right group D-E-F */}
                <div className="flex gap-2">
                  {row.slice(3, 6).map((seat, i) => {
                    if (!seat) return null;
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={i}
                        onClick={() => handleSeatClick(seat.seatNumber, seat.isBooked)}
                        disabled={seat.isBooked}
                        title={seat.seatNumber}
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-150 ${
                          seat.isBooked
                            ? "bg-stone-100 border-stone-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-orange-500 border-orange-500 shadow-md scale-105"
                            : "bg-white border-orange-200 hover:border-orange-400 hover:bg-orange-50 active:scale-95"
                        }`}
                      >
                        <Armchair
                          size={14}
                          strokeWidth={2}
                          className={
                            seat.isBooked
                              ? "text-stone-300"
                              : isSelected
                              ? "text-white"
                              : "text-stone-500"
                          }
                        />
                        <span className={`text-[10px] font-bold leading-none mt-0.5 ${
                          seat.isBooked ? "text-stone-300" : isSelected ? "text-white" : "text-stone-500"
                        }`}>
                          {seat.seatNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Row number right */}
                <div className="w-6 text-center text-xs font-semibold text-stone-400">
                  {rowIndex + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            selectedSeats.length === 0
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-400 text-white shadow-sm"
          }`}
        >
          {selectedSeats.length === 0 ? (
            <>
              <XCircle size={16} strokeWidth={2} />
              Select at least one seat
            </>
          ) : (
            <>
              <CheckCircle2 size={16} strokeWidth={2} />
              Book {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default FlightSeatSelection;