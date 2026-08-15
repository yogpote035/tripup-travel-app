import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./LuxuryCalendar.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const atMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const today = () => atMidnight(new Date());
const fromISO = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? parsed : null;
};
const toISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const isSameDay = (left, right) => left && right && left.getTime() === right.getTime();
const isBefore = (left, right) => left.getTime() < right.getTime();
const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const isSameMonth = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
const formatDate = (date) => date?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const useOutsideClose = (ref, close) => {
  useEffect(() => {
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) close();
    };
    const onKeyDown = (event) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, ref]);
};

const CalendarGrid = ({ visibleMonth, minDate, selectedStart, selectedEnd, onSelect, hoverDate, onHover }) => {
  const first = monthStart(visibleMonth);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const gridDates = useMemo(() => {
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - firstWeekday);
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }, [first.getFullYear(), first.getMonth(), firstWeekday]);

  return (
    <>
      <div className="luxury-calendar__weekdays">
        {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="luxury-calendar__days">
        {gridDates.map((date) => {
          const inMonth = date.getMonth() === first.getMonth();
          const disabled = !inMonth || isBefore(date, minDate);
          const activeEnd = selectedEnd || hoverDate;
          const inRange = selectedStart && activeEnd && date > selectedStart && date < activeEnd;
          const isStart = isSameDay(date, selectedStart);
          const isEnd = isSameDay(date, selectedEnd);
          const isToday = isSameDay(date, today());
          const className = [
            "luxury-calendar__day",
            disabled && "is-disabled",
            isStart && "is-start",
            isEnd && "is-end",
            inRange && "is-in-range",
            isToday && "is-today",
          ].filter(Boolean).join(" ");

          return (
            <button
              aria-label={formatDate(date)}
              className={className}
              disabled={disabled}
              key={toISO(date)}
              onClick={() => !disabled && onSelect(date)}
              onMouseEnter={() => !disabled && onHover?.(date)}
              onMouseLeave={() => onHover?.(null)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
};

export function LuxuryDatePicker({ value = "", onChange, minDate: minDateValue, placeholder = "Select a date", disabled = false, className = "" }) {
  const minDate = atMidnight(fromISO(minDateValue) || today());
  const selected = fromISO(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(monthStart(selected && !isBefore(selected, minDate) ? selected : minDate));

  useEffect(() => {
    if (selected && !isBefore(selected, minDate)) setVisibleMonth(monthStart(selected));
  }, [value, minDate.getTime()]);

  return (
    <div className={`luxury-calendar ${className}`.trim()}>
      <button aria-expanded={open} className={`luxury-calendar__trigger ${open ? "is-open" : ""}`} disabled={disabled} onClick={() => setOpen((current) => !current)} type="button">
        <CalendarDays size={17} />
        <span>{selected ? formatDate(selected) : placeholder}</span>
        <ChevronDown className="luxury-calendar__chevron" size={16} />
      </button>
      {open && <DatePickerPanel minDate={minDate} selected={selected} setOpen={setOpen} visibleMonth={visibleMonth} setVisibleMonth={setVisibleMonth} onChange={onChange} />}
    </div>
  );
}

function DatePickerPanel({ minDate, selected, setOpen, visibleMonth, setVisibleMonth, onChange }) {
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));
  const minMonth = monthStart(minDate);
  const canGoBack = visibleMonth > minMonth && !isSameMonth(visibleMonth, minMonth);
  const move = (amount) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  return <div className="luxury-calendar__popover" ref={ref} role="dialog" aria-label="Date picker">
    <div className="luxury-calendar__nav">
      <button aria-label="Previous month" className="luxury-calendar__nav-button" disabled={!canGoBack} onClick={() => move(-1)} type="button"><ChevronLeft size={17} /></button>
      <strong>{visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
      <button aria-label="Next month" className="luxury-calendar__nav-button" onClick={() => move(1)} type="button"><ChevronRight size={17} /></button>
    </div>
    <CalendarGrid minDate={minDate} onSelect={(date) => { onChange(toISO(date)); setOpen(false); }} selectedStart={selected} visibleMonth={visibleMonth} />
  </div>;
}

export function LuxuryDateRangePicker({ startDate = "", endDate = "", onChange, minDate: minDateValue, placeholder = "Select your travel dates" }) {
  const minDate = atMidnight(fromISO(minDateValue) || today());
  const initialStart = fromISO(startDate);
  const initialEnd = fromISO(endDate);
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(initialStart);
  const [draftEnd, setDraftEnd] = useState(initialEnd);
  const [hoverDate, setHoverDate] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(monthStart(initialStart && !isBefore(initialStart, minDate) ? initialStart : minDate));
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  useEffect(() => { setDraftStart(fromISO(startDate)); setDraftEnd(fromISO(endDate)); }, [startDate, endDate]);

  const select = (date) => {
    if (!draftStart || draftEnd) {
      setDraftStart(date); setDraftEnd(null); return;
    }
    const [start, end] = date < draftStart ? [date, draftStart] : [draftStart, date];
    setDraftStart(start); setDraftEnd(end); setOpen(false);
    onChange({ startDate: toISO(start), endDate: toISO(end) });
  };
  const clear = () => { setDraftStart(null); setDraftEnd(null); onChange({ startDate: "", endDate: "" }); };
  const minMonth = monthStart(minDate);
  const canGoBack = visibleMonth > minMonth && !isSameMonth(visibleMonth, minMonth);
  const nights = draftStart && draftEnd ? Math.round((draftEnd - draftStart) / 86400000) : 0;

  return (
    <div className="luxury-calendar luxury-calendar--range" ref={ref}>
      <button aria-expanded={open} className={`luxury-calendar__trigger ${open ? "is-open" : ""}`} onClick={() => setOpen((current) => !current)} type="button">
        <CalendarDays size={17} />
        <span>{draftStart ? `${formatDate(draftStart)}${draftEnd ? ` — ${formatDate(draftEnd)} · ${nights} night${nights === 1 ? "" : "s"}` : " — Select end date"}` : placeholder}</span>
        <ChevronDown className="luxury-calendar__chevron" size={16} />
      </button>
      {open && <div aria-label="Travel date range" className="luxury-calendar__popover" role="dialog">
        <div className="luxury-calendar__nav">
          <button aria-label="Previous month" className="luxury-calendar__nav-button" disabled={!canGoBack} onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} type="button"><ChevronLeft size={17} /></button>
          <strong>{visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
          <button aria-label="Next month" className="luxury-calendar__nav-button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} type="button"><ChevronRight size={17} /></button>
        </div>
        <CalendarGrid hoverDate={draftStart && !draftEnd ? hoverDate : null} minDate={minDate} onHover={setHoverDate} onSelect={select} selectedEnd={draftEnd} selectedStart={draftStart} visibleMonth={visibleMonth} />
        <div className="luxury-calendar__footer"><span>{!draftStart ? "Choose your departure date" : !draftEnd ? "Choose your return date" : `${nights} night${nights === 1 ? "" : "s"} selected`}</span><button onClick={clear} type="button"><X size={14} /> Clear</button></div>
      </div>}
    </div>
  );
}
