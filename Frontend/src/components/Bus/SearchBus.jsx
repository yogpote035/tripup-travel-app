import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBusesBetweenStations } from "../../../AllStatesFeatures/Bus/AllBusSlice";
import { toast } from "react-toastify";
import {
  Bus, MapPin, Search, AlertCircle, Loader2, ArrowRight,
  ChevronLeft, ChevronRight,
} from "lucide-react";

/* ── Design tokens ── */
const perf =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";
const dash =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS    = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/* ── Helpers ── */
const TearLine = ({ label }) => (
  <div className="flex items-center px-4">
    <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
    <div className="flex-1 h-px mx-1" style={{ background: dash }} />
    {label && <>
      <span className="text-xs font-black tracking-widest text-stone-300 uppercase px-3 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px mx-1" style={{ background: dash }} />
    </>}
    <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
  </div>
);

/* ══════════════════════════════════════
   INLINE TICKET DATE PICKER
   Opens below the trigger, inside the card
══════════════════════════════════════ */
const TicketDatePicker = ({ value, onChange }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [open, setOpen]       = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selected = value
    ? (() => { const d = new Date(value); d.setHours(0,0,0,0); return d; })()
    : null;

  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  };

  const selectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(d.toISOString().split("T")[0]);
    setOpen(false);
  };

  const isPast  = (d) => new Date(viewYear, viewMonth, d) < today;
  const isSel   = (d) => selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth()    === viewMonth &&
    selected.getDate()     === d;
  const isToday = (d) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === d;

  const displayLabel = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0,3).toUpperCase()} ${selected.getFullYear()}`
    : "Select Date";

  return (
    <div>
      {/* Trigger */}
      <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">
        Date · Departs
      </label>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`relative w-full flex items-center gap-2 pl-9 pr-4 py-2.5 bg-orange-50 border-2 rounded-xl text-sm font-medium transition-all text-left ${
          open
            ? "border-orange-400 ring-2 ring-orange-200"
            : "border-orange-200"
        } ${selected ? "text-stone-800" : "text-stone-400"}`}
      >
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {displayLabel}
      </button>

      {/* ── Inline calendar — renders INSIDE the form flow ── */}
      {open && (
        <div className="mt-3 border-2 border-orange-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="h-1" style={{ background: perf }} />

          {/* Month nav */}
          <div className="bg-stone-900 px-5 py-3 flex items-center justify-between">
            <button type="button" onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all">
              <ChevronLeft size={15} />
            </button>
            <div className="text-center">
              <p className="text-xs font-black tracking-widest text-stone-500 uppercase leading-none mb-0.5">{viewYear}</p>
              <p className="font-black text-white text-base tracking-widest uppercase leading-none">{MONTHS[viewMonth]}</p>
            </div>
            <button type="button" onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all">
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Inner tear line */}
          <div className="flex items-center px-3 bg-white">
            <div className="w-3 h-3 rounded-full bg-orange-50 border-2 border-orange-200 -ml-5 flex-shrink-0" />
            <div className="flex-1 h-px mx-1" style={{ background: dash }} />
            <div className="w-3 h-3 rounded-full bg-orange-50 border-2 border-orange-200 -mr-5 flex-shrink-0" />
          </div>

          {/* Day headers */}
          <div className="bg-white grid grid-cols-7 px-4 pt-2 pb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-black tracking-wider text-stone-300 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="bg-white grid grid-cols-7 px-4 pb-4 gap-y-1">
            {Array.from({ length: firstDayOfMonth }).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_,i) => {
              const day = i + 1;
              const past = isPast(day);
              const sel  = isSel(day);
              const tod  = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => selectDay(day)}
                  className={`relative flex flex-col items-center justify-center rounded-lg h-9 text-xs font-black transition-all duration-150
                    ${sel  ? "bg-orange-500 text-white shadow-md scale-105" : ""}
                    ${!sel && past ? "text-stone-300 cursor-not-allowed" : ""}
                    ${!sel && !past && tod ? "border-2 border-orange-400 text-orange-500" : ""}
                    ${!sel && !past && !tod ? "text-stone-700 hover:bg-orange-50 hover:text-orange-500" : ""}
                  `}
                >
                  {day}
                  {tod && !sel && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center px-3 bg-white">
            <div className="w-3 h-3 rounded-full bg-orange-50 border-2 border-orange-200 -ml-5 flex-shrink-0" />
            <div className="flex-1 h-px mx-1" style={{ background: dash }} />
            <div className="w-3 h-3 rounded-full bg-orange-50 border-2 border-orange-200 -mr-5 flex-shrink-0" />
          </div>
          <div className="bg-stone-900 px-5 py-2.5 flex items-center justify-between">
            <span className="text-xs font-black tracking-widest text-stone-500 uppercase">
              {selected ? displayLabel : "No date selected"}
            </span>
            {selected && (
              <button type="button" onClick={() => onChange("")}
                className="text-xs font-black tracking-widest text-orange-400 hover:text-orange-300 uppercase transition-colors">
                Clear
              </button>
            )}
          </div>
          <div className="h-1" style={{ background: perf }} />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   BUS SEARCH — FULL CARD
══════════════════════════════════════ */
const BusSearch = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.bus);

  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) { toast.error("Please fill all fields"); return; }
    dispatch(fetchBusesBetweenStations({ from, to, date }));
  };

  const displayDate = date
    ? (() => {
        const d = new Date(date);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
      })()
    : "DATE";

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="bg-white border-2 border-orange-200 rounded-3xl shadow-lg overflow-visible">

        {/* Top perf */}
        <div className="h-1.5 rounded-t-3xl" style={{ background: perf }} />

        {/* ── Dark header ── */}
        <div className="bg-stone-900 px-7 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-black tracking-widest text-stone-500 uppercase mb-0.5">Ticket Search · Bus</p>
              <p className="text-white font-black text-lg tracking-widest uppercase">TRIPUP BUS</p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/40 rounded-xl flex items-center justify-center">
              <Bus size={18} className="text-orange-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Live route preview */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">From</p>
              <p className="font-black text-2xl text-white tracking-widest leading-none truncate">
                {from ? from.slice(0,3).toUpperCase() : "???"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 flex-shrink-0">
              <Bus size={16} className="text-orange-400" strokeWidth={1.8} />
              <div className="w-16 h-px" style={{ background: dash }} />
              <p className="text-xs text-stone-600 tracking-widest uppercase">{displayDate}</p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-stone-500 uppercase tracking-widest leading-none mb-0.5">To</p>
              <p className="font-black text-2xl text-orange-400 tracking-widest leading-none truncate">
                {to ? to.slice(0,3).toUpperCase() : "???"}
              </p>
            </div>
          </div>
        </div>

        {/* Tear line */}
        <TearLine label="Search Details" />

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="px-7 py-6">
          <p className="text-xs font-black tracking-widest text-stone-400 uppercase mb-4">Enter Journey Details</p>

          {/* From + To on one row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">From · Gate A</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Departure city"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-orange-50 border-2 border-orange-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black tracking-widest text-stone-500 uppercase mb-1.5">To · Gate B</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Arrival city"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-orange-50 border-2 border-orange-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Date picker — full width, expands inline */}
          <div className="mb-5">
            <TicketDatePicker value={date} onChange={setDate} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-3 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-stone-500 font-medium">{error}</p>
            </div>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-md text-white ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-400 active:scale-[0.99]"
            }`}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" />Searching...</>
              : <><Search size={16} />Search Buses<ArrowRight size={14} /></>
            }
          </button>
        </form>

        {/* Bottom tear + barcode */}
        <TearLine />

        <div className="bg-stone-900 rounded-b-3xl px-7 py-3">
          <div className="flex items-end gap-px h-7 mb-1.5">
            {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,3,1,2,1,4,2,1,3,1,2,3,1,2,1,3,2,1].map((w,i) => (
              <div key={i} className="bg-white rounded-sm"
                style={{ width:`${w*2.5}px`, height:`${50+(i%3)*20}%`, opacity:0.07+(i%4)*0.13 }} />
            ))}
          </div>
          <p className="text-center text-xs tracking-widest text-stone-600 uppercase font-semibold">TRIPUP · BON VOYAGE</p>
        </div>

      </div>
    </div>
  );
};

export default BusSearch;
