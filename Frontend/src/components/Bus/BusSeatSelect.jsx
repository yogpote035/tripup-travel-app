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
  IndianRupee,
  Bus,
} from "lucide-react";

const perforation =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";
const dashedH =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const chunkArray = (arr, size) => {
  const chunked = [];
  for (let i = 0; i < arr.length; i += size) chunked.push(arr.slice(i, i + size));
  return chunked;
};

const seatClass = (isBooked, isSelected) => {
  if (isBooked) return "bg-red-100 border-red-300 text-red-400 cursor-not-allowed";
  if (isSelected) return "bg-orange-500 border-orange-600 text-white shadow-lg scale-105";
  return "bg-white border-orange-200 text-stone-500 hover:bg-orange-50 hover:border-orange-400";
};

const BusSeatSelect = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    setDisableButton(selectedSeats.length === 0);
  }, [selectedSeats]);

  const navigate = useNavigate();
  const { state } = useLocation();
  const routeState = state || {};
  const bus = routeState.bus || {};
  // Bus records can come from SQL as JSON strings or from older clients with
  // slightly different seat field names. Normalize them once at the boundary
  // so every layout and booking action uses the same shape.
  const rawSeatValue = Array.isArray(routeState.seats) ? routeState.seats : bus.seats;
  const busType = String(bus.type || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const isSleeperBus = busType === "sleeper";
  const rawSeats = Array.isArray(rawSeatValue)
    ? rawSeatValue
    : typeof rawSeatValue === "string"
    ? (() => {
        try { return JSON.parse(rawSeatValue); } catch { return []; }
      })()
    : [];
  const seats = rawSeats.map((seat, index) => ({
    ...seat,
    seatNumber: seat.seatNumber ?? seat.number ?? index + 1,
    // Older bus records generated seats as "Seater" even when the bus itself
    // was configured as Sleeper. The bus-level type is authoritative here.
    seatType: String(isSleeperBus ? "sleeper" : seat.seatType || seat.type || bus.type || "seater")
      .toLowerCase()
      .replace(/[\s_-]+/g, ""),
    isBooked:
      Boolean(seat.isBooked) || String(seat.status || "").toLowerCase() === "booked",
  }));

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(String(seatNumber))
        ? prev.filter((n) => n !== String(seatNumber))
        : [...prev, String(seatNumber)]
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) { toast.warn("Please select at least one seat."); return; }
    const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(String(s.seatNumber)));
    navigate("/bus-seat-book", { state: { selectedSeats: selectedSeatObjects, bus } });
  };

  const allSleeper = seats.length > 0 && (isSleeperBus || seats.every((s) => s.seatType.includes("sleeper")));
  // Luxury, AC, semi-sleeper and legacy mixed records use the standard
  // four-column seat grid unless every seat is explicitly a sleeper berth.
  const allSeater = seats.length > 0 && !allSleeper;
  const upperDeck = allSleeper ? seats.filter((s) => s.seatNumber % 2 === 0) : [];
  const lowerDeck = allSleeper ? seats.filter((s) => s.seatNumber % 2 !== 0) : [];

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER BOARDING PASS ── */}
        <div className="bg-white border-2 border-orange-200 rounded-3xl shadow-sm overflow-hidden mb-8">
          <div className="h-1.5 w-full" style={{ background: perforation }} />

          {/* Dark header */}
          <div className="bg-stone-900 px-7 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black tracking-widest text-stone-500 uppercase mb-0.5">
                  Seat Selection · Bus
                </p>
                <p className="text-white font-black text-lg tracking-widest uppercase">
                  {bus.company || bus.operator || bus.type || "Bus"}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/40 rounded-xl flex items-center justify-center">
                <Bus size={18} className="text-orange-400" strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">From</p>
                <p className="font-black text-xl text-white tracking-widest leading-none">
                  {bus.source?.slice(0, 3).toUpperCase() || "SRC"}
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <Bus size={16} className="text-orange-400" strokeWidth={1.8} />
                <div className="w-full h-px" style={{ background: dashedH }} />
                <p className="text-xs text-stone-600 tracking-widest uppercase">{bus.busNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">To</p>
                <p className="font-black text-xl text-orange-400 tracking-widest leading-none">
                  {bus.destination?.slice(0, 3).toUpperCase() || "DST"}
                </p>
              </div>
            </div>
          </div>

          {/* Legend tear line */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
            <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
            <span className="text-xs font-black tracking-widest text-stone-300 uppercase px-3 whitespace-nowrap">Seat Legend</span>
            <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
          </div>

          {/* Legend */}
          <div className="px-7 py-4 flex flex-wrap justify-center gap-5">
            {[
              { color: "bg-orange-500 border-orange-600", label: "Selected" },
              { color: "bg-white border-orange-200", label: "Available" },
              { color: "bg-red-100 border-red-300", label: "Booked" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md border-2 ${color}`} />
                <span className="text-xs font-black tracking-wide text-stone-500 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEATER LAYOUT ── */}
        {allSeater && (
          <div className="bg-white border-2 border-orange-200 rounded-3xl shadow-sm overflow-hidden mb-6">
            <div className="h-1.5" style={{ background: perforation }} />
            <div className="bg-stone-900 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Armchair size={16} className="text-orange-400" strokeWidth={1.5} />
                <span className="text-xs font-black tracking-widest text-white uppercase">Seater Layout</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-lg">
                <Gauge size={14} className="text-orange-400" />
                <span className="text-xs font-black tracking-widest text-stone-300 uppercase">Driver</span>
              </div>
            </div>

            <div className="flex items-center px-4">
              <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
              <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
              <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
            </div>

            <div className="px-6 py-5 flex flex-col gap-3">
              {chunkArray(seats, 4).map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-3 items-center justify-center">
                  {row.slice(0, 2).map((seat) => (
                    <button
                      key={seat.seatNumber}
                      disabled={seat.isBooked}
                      onClick={() => toggleSeat(seat.seatNumber)}
                      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 font-black ${seatClass(seat.isBooked, selectedSeats.includes(String(seat.seatNumber)))}`}
                    >
                      <Armchair size={18} strokeWidth={2} />
                      <span className="text-xs mt-0.5">{seat.seatNumber}</span>
                    </button>
                  ))}
                  {/* Aisle */}
                  <div className="flex items-center justify-center">
                    <div className="h-10 w-px bg-orange-200" />
                  </div>
                  {row.slice(2, 4).map((seat) => (
                    <button
                      key={seat.seatNumber}
                      disabled={seat.isBooked}
                      onClick={() => toggleSeat(seat.seatNumber)}
                      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 font-black ${seatClass(seat.isBooked, selectedSeats.includes(String(seat.seatNumber)))}`}
                    >
                      <Armchair size={18} strokeWidth={2} />
                      <span className="text-xs mt-0.5">{seat.seatNumber}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="h-1.5" style={{ background: perforation }} />
          </div>
        )}

        {/* ── SLEEPER LAYOUT ── */}
        {allSleeper && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[
              { label: "Lower Deck", data: lowerDeck },
              { label: "Upper Deck", data: upperDeck },
            ].map(({ label, data }) => (
              <div key={label} className="bg-white border-2 border-orange-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="h-1.5" style={{ background: perforation }} />
                <div className="bg-stone-900 px-5 py-3 flex items-center gap-2">
                  <BedDouble size={16} className="text-orange-400" strokeWidth={1.5} />
                  <span className="text-xs font-black tracking-widest text-white uppercase">{label}</span>
                </div>
                <div className="flex items-center px-3">
                  <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -ml-5 flex-shrink-0" />
                  <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
                  <div className="w-4 h-4 rounded-full bg-orange-50 border-2 border-orange-200 -mr-5 flex-shrink-0" />
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  {chunkArray(data, 3).map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-3 items-start justify-center">
                      {/* Single berth */}
                      <div className="flex justify-center">
                        {row[2] && (
                          <SleeperBerth
                            seat={row[2]}
                            isSelected={selectedSeats.includes(String(row[2].seatNumber))}
                            onToggle={toggleSeat}
                            fare={bus.fare}
                          />
                        )}
                      </div>
                      {/* Double berth */}
                      <div className="col-span-2 flex gap-3 justify-center">
                        {row.slice(0, 2).map((seat) => (
                          <SleeperBerth
                            key={seat.seatNumber}
                            seat={seat}
                            isSelected={selectedSeats.includes(String(seat.seatNumber))}
                            onToggle={toggleSeat}
                            fare={bus.fare}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-1.5" style={{ background: perforation }} />
              </div>
            ))}
          </div>
        )}

        {/* Mixed warning */}
        {seats.length === 0 && (
          <div className="bg-white border-2 border-orange-200 rounded-2xl p-5 flex items-center gap-3 mb-6">
            <AlertTriangle size={20} className="text-orange-400 flex-shrink-0" />
            <span className="text-stone-600 font-semibold text-sm">Seat availability is not available for this bus.</span>
          </div>
        )}

        {/* ── CONFIRM FOOTER ── */}
        <div className="bg-white border-2 border-orange-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ background: perforation }} />
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
            <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
          </div>
          <div className="bg-stone-900 px-7 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-widest text-stone-500 uppercase mb-0.5">Your Selection</p>
              <p className="text-white font-black text-base tracking-wide">
                {selectedSeats.length === 0
                  ? "No seats selected"
                  : `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} — ${selectedSeats.join(", ")}`}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={disableButton}
              className={`flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all uppercase tracking-widest text-sm ${
                !disableButton
                  ? "bg-orange-500 hover:bg-orange-400 active:scale-95 text-white shadow-md"
                  : "bg-stone-700 text-stone-500 cursor-not-allowed opacity-60"
              }`}
            >
              {disableButton ? (
                <><XCircle size={16} /> Select a seat</>
              ) : (
                <><CheckCircle2 size={16} /> Confirm ({selectedSeats.length})</>
              )}
            </button>
          </div>
          {/* Barcode */}
          <div className="bg-stone-900 px-7 pb-4 border-t border-stone-800">
            <div className="flex items-end gap-px h-7 mb-1.5">
              {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,3,1,2,1,4,2,1,3,1,2,3,1,2,1,3].map((w, i) => (
                <div key={i} className="bg-white rounded-sm" style={{ width: `${w * 2.5}px`, height: `${50 + (i % 3) * 20}%`, opacity: 0.07 + (i % 4) * 0.13 }} />
              ))}
            </div>
            <p className="text-center text-xs tracking-widest text-stone-600 uppercase font-semibold">TRIPUP · BON VOYAGE</p>
          </div>
          <div className="h-1.5" style={{ background: perforation }} />
        </div>

      </div>
    </div>
  );
};

/* ── Sleeper berth sub-component ── */
const SleeperBerth = ({ seat, isSelected, onToggle, fare }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs font-black tracking-widest text-stone-400 mb-1">#{seat.seatNumber}</span>
    <button
      disabled={seat.isBooked}
      onClick={() => onToggle(seat.seatNumber)}
      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-200 ${
        seat.isBooked
          ? "bg-red-100 border-red-300 text-red-400 cursor-not-allowed"
          : isSelected
          ? "bg-orange-500 border-orange-600 text-white shadow-lg scale-105"
          : "bg-white border-orange-200 text-stone-400 hover:bg-orange-50 hover:border-orange-400"
      }`}
    >
      <img
        src="/Sleeper-Seat.png"
        alt={`Sleeper berth ${seat.seatNumber}`}
        className={`h-full w-full max-h-20 sm:max-h-24 object-contain p-1 sm:p-1.5 ${
          seat.isBooked ? "opacity-45 grayscale" : ""
        }`}
      />
    </button>
    <div className="flex items-center gap-0.5 mt-1">
      {seat.isBooked ? (
        <span className="text-xs text-red-400 font-black tracking-wide">SOLD</span>
      ) : (
        <>
          <IndianRupee size={9} className="text-stone-400" />
          <span className="text-xs text-stone-400 font-semibold">{fare}</span>
        </>
      )}
    </div>
  </div>
);

export default BusSeatSelect;
