import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangePickerWithInlineButtons({ onChange }) {
  const [selection, setSelection] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSelect = (ranges) => {
    setSelection([ranges.selection]);
  };

  const handleApply = () => {
    const selectedStartDate = format(selection[0].startDate, "yyyy-MM-dd");
    const selectedEndDate = format(selection[0].endDate, "yyyy-MM-dd");
    onChange({ startDate: selectedStartDate, endDate: selectedEndDate });
    setOpen(false);
  };

  const handleClear = () => {
    const today = new Date();
    const cleared = [
      {
        startDate: today,
        endDate: today,
        key: "selection",
      },
    ];
    setSelection(cleared);
    onChange({ startDate: "", endDate: "" });
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatted = `${format(
    selection[0].startDate,
    "MMM dd"
  )} - ${format(selection[0].endDate, "MMM dd, yyyy")}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded w-full text-left"
      >
        📅 {formatted}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={selection}
            rangeColors={["#f43f5e"]}
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleClear}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
