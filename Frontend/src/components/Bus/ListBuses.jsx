import { useSelector } from "react-redux";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  Clock,
  ArrowRight,
  Users,
  IndianRupee,
  Armchair,
} from "lucide-react";

const perforation =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";
const dashedH =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const ListBuses = () => {
  const { buses, loading, error } = useSelector((state) => state.bus);
  const navigate = useNavigate();

  if (loading) return <Loading message="Fetching Buses..." />;

  if (error)
    return (
      <div className="flex items-center justify-center mt-16 px-4">
        <div className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden max-w-md w-full shadow-lg">
          <div className="h-1.5" style={{ background: perforation }} />
          <div className="p-6 text-center">
            <p className="text-red-500 font-bold text-lg">{error}</p>
          </div>
        </div>
      </div>
    );

  if (buses.length === 0)
    return (
      <div className="flex items-center justify-center mt-16 px-4">
        <div className="bg-white border-2 border-orange-200 rounded-3xl overflow-hidden max-w-md w-full shadow-lg">
          <div className="h-1.5" style={{ background: perforation }} />
          <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
            <p className="text-xs font-black tracking-widest text-stone-500 uppercase">No Results</p>
            <Bus size={18} className="text-orange-400" strokeWidth={1.8} />
          </div>
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
            <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
          </div>
          <div className="px-6 py-6 text-center">
            <Bus size={44} className="text-orange-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-stone-700 font-black text-lg uppercase tracking-wide mb-1">No Buses Found</p>
            <p className="text-stone-400 text-sm">Try searching for a different route or date</p>
          </div>
          <div className="h-1.5" style={{ background: perforation }} />
        </div>
      </div>
    );

  return (
    <div className="mt-6 mb-12 max-w-5xl mx-auto px-4">

      {/* Results header */}
      <div className="flex items-center gap-3 bg-white border-2 border-orange-200 rounded-2xl px-5 py-3 mb-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: perforation }} />
        <div className="w-9 h-9 flex items-center justify-center bg-orange-100 rounded-lg mt-0.5">
          <Bus size={18} className="text-orange-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-black tracking-widest text-stone-400 uppercase leading-none mb-0.5">
            Search Results
          </p>
          <h2 className="text-base font-black text-stone-900 uppercase tracking-wide leading-none">
            {buses.length} Bus{buses.length !== 1 ? "es" : ""} Available
          </h2>
        </div>
      </div>

      {/* Bus cards */}
      <div className="space-y-5">
        {buses.map((bus, index) => (
          <div
            key={index}
            className="bg-white border-2 border-orange-200 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Top perforation */}
            <div className="h-1.5 w-full" style={{ background: perforation }} />

            {/* Dark ticket header */}
            <div className="bg-stone-900 px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                {/* Company + bus info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-orange-500/20 border border-orange-500/40 rounded-xl">
                    <Bus size={18} className="text-orange-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-black text-white text-base tracking-wide uppercase leading-none">
                      {bus.company}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-400 font-semibold tracking-widest uppercase">
                        {bus.busNumber}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="text-xs text-stone-400 font-semibold tracking-wide uppercase">
                        {bus.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fare + seats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-stone-400 text-xs font-semibold uppercase tracking-wide">
                    <Users size={13} />
                    <span>{bus.availableSeats} seats left</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-orange-400 font-black text-2xl tracking-tight">
                    <IndianRupee size={18} strokeWidth={2.5} />
                    <span>{bus.fare}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stub tear line */}
            <div className="flex items-center px-4 bg-white">
              <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
              <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
              <span className="text-xs font-black tracking-widest text-stone-300 uppercase px-3 whitespace-nowrap">
                Journey Details
              </span>
              <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
              <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
            </div>

            {/* Journey route */}
            <div className="px-6 py-5">
              <div className="flex justify-between items-center mb-5">
                {/* Departure */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={13} className="text-stone-400" />
                    <span className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
                      {bus.source}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-stone-900 tracking-tight leading-none">
                    {bus.departureAt}
                  </p>
                </div>

                {/* Duration / flight path */}
                <div className="flex-1 flex flex-col items-center px-4 gap-1">
                  <div className="flex items-center gap-1 text-stone-400 text-xs font-semibold uppercase tracking-wide">
                    <Clock size={12} />
                    <span>{bus.duration}</span>
                  </div>
                  <div className="w-full flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <div className="flex-1 h-px" style={{ background: dashedH }} />
                    <Bus size={14} className="text-orange-400 flex-shrink-0" strokeWidth={1.8} />
                    <div className="flex-1 h-px" style={{ background: dashedH }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  </div>
                  <span className="text-xs text-stone-300 tracking-widest uppercase font-black">
                    DIRECT
                  </span>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <span className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
                      {bus.destination}
                    </span>
                    <MapPin size={13} className="text-stone-400" />
                  </div>
                  <p className="text-3xl font-black text-stone-900 tracking-tight leading-none">
                    {bus.arrivalAt}
                  </p>
                </div>
              </div>

              {/* Book button */}
              <button
                onClick={() =>
                  navigate(`/bus-seat/${bus.busId}`, {
                    state: {
                      bus,
                      seats: bus?.seats || 0,
                      journeyDate: bus.journeyDate,
                      source: bus.source,
                      destination: bus.destination,
                    },
                  })
                }
                className="w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.99] text-white py-3 px-4 rounded-xl transition-all font-black flex items-center justify-center gap-2 shadow-md uppercase tracking-widest text-sm"
              >
                <Armchair size={16} strokeWidth={2} />
                View Seats & Book
                <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Barcode footer */}
            <div className="bg-stone-900 px-6 py-2.5 flex items-end gap-px h-8 border-t border-stone-800">
              {[2,1,3,1,2,1,3,2,1,2,1,3,1,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2].map((w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-sm"
                  style={{
                    width: `${w * 2.5}px`,
                    height: `${50 + (i % 3) * 20}%`,
                    opacity: 0.07 + (i % 4) * 0.13,
                  }}
                />
              ))}
            </div>

            {/* Bottom perforation */}
            <div className="h-1.5 w-full" style={{ background: perforation }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListBuses;
