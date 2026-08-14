import { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { Calendar, Users, Bus, Footprints, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import Loading from "../../General/Loading";
import { getItineraryById } from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";

const DayCard = memo(({ dayObj, dayNumber }) => {
    const [open, setOpen] = useState(false);
    const safeDate = dayObj?.date ? new Date(dayObj.date) : null;
    const hasValidDate = safeDate instanceof Date && !Number.isNaN(safeDate.getTime());
    const activities = Array.isArray(dayObj?.activities)
        ? dayObj.activities
        : Array.isArray(dayObj)
            ? dayObj
            : dayObj && typeof dayObj === "object"
                ? Object.values(dayObj).filter((v) => typeof v === "string")
                : [];

    return (
        <div className="day-wrap bg-white border border-stone-100 rounded-2xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-left bg-stone-50 hover:bg-orange-50/40 transition-colors duration-200 ${open ? "border-b border-stone-100" : ""}`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold font-mono shadow-[0_2px_8px_rgba(232,105,74,0.28)]">
                        {String(dayNumber).padStart(2, "0")}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-stone-700 font-dm leading-tight">Day {dayNumber}</p>
                        <p className="text-xs text-stone-400 font-dm mt-0.5">
                            {hasValidDate ? format(safeDate, "EEE, dd MMM yyyy") : "Flexible day plan"}
                        </p>
                    </div>
                </div>
                <ChevronDown size={15} className={`chev text-stone-400 ${open ? "chev-open" : ""}`} />
            </button>
            {open && (
                <div className="px-4 py-1 bg-white">
                    {activities.length > 0 ? (
                        activities.map((act, i) => (
                            <div key={i} className="act-row flex items-start gap-3 py-3 text-sm text-stone-500 font-dm leading-relaxed">
                                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                <span>{act}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-stone-400 py-3">No activities listed for this day.</div>
                    )}
                </div>
            )}
        </div>
    );
});

const TransportBadge = ({ mode }) => {
    const MAP = {
        public: { icon: <Bus size={10} />, label: "Public" },
        walking: { icon: <Footprints size={10} />, label: "Walking" },
        private: { icon: <Bus size={10} />, label: "Private" },
    };
    const item = MAP[mode];
    if (!item) return null;
    return (
        <div className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-[0.68rem] font-semibold font-dm px-2.5 py-1 rounded-md tracking-wide">
            {item.icon} {item.label}
        </div>
    );
};

const BudgetDots = ({ budget }) => {
    const level = { low: 1, medium: 2, high: 3 }[budget?.toLowerCase()] || 1;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i <= level ? "bg-orange-400" : "bg-stone-200"}`} />
            ))}
        </div>
    );
};

const ItineraryPublicView = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedItinerary: itinerary, loading, error } = useSelector((state) => state.itinerary);

    useEffect(() => {
        if (id) {
            dispatch(getItineraryById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return <Loading message="Loading shared itinerary…" color="border-t-orange-400" />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-12">
                <div className="max-w-xl w-full bg-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm">
                    <p className="text-sm text-stone-500 mb-4">Unable to load this itinerary.</p>
                    <h1 className="text-3xl font-bold text-stone-900 mb-3">Itinerary not available</h1>
                    <p className="text-sm text-stone-400 mb-6">The itinerary may have been removed or the link is invalid.</p>
                    <Link to="/" className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition-all">
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    if (!itinerary) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-12">
                <div className="max-w-xl w-full bg-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-stone-900 mb-3">Itinerary not found</h1>
                    <p className="text-sm text-stone-400 mb-6">No itinerary data is available for this link.</p>
                    <Link to="/" className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition-all">
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const start = itinerary.startDate ? new Date(itinerary.startDate) : null;
    const end = itinerary.endDate ? new Date(itinerary.endDate) : null;
    const created = itinerary.createdAt ? new Date(itinerary.createdAt) : null;
    const hasValidStart = start && !Number.isNaN(start.getTime());
    const hasValidEnd = end && !Number.isNaN(end.getTime());
    const nights = hasValidStart && hasValidEnd ? Math.round((end - start) / 86400000) : null;

    return (
        <div className="itinerary-experience min-h-screen font-dm pb-24 bg-[#FAF7F2] px-4 pt-12">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">Shared Itinerary</p>
                    <h1 className="mt-4 text-4xl font-bold text-stone-900">View your trip plan</h1>
                    <p className="mt-3 text-sm text-stone-500 max-w-2xl mx-auto">This itinerary is view-only. Log in to make edits or manage your plans.</p>
                </div>

                <div className="ticket-card rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(26,18,8,0.08),0_2px_8px_rgba(26,18,8,0.04)] border border-stone-100 bg-white">
                    <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pt-5 pb-6 overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                        <div className="relative flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="badge-shimmer text-white text-[0.62rem] font-bold tracking-[.14em] uppercase px-3 py-1 rounded-full font-dm">Shared</div>
                            </div>
                        </div>
                        <div className="relative flex items-end justify-between">
                            <div>
                                <p className="font-mono text-[0.6rem] text-white/40 tracking-[.22em] uppercase mb-1">From</p>
                                <p className="font-mono text-5xl font-medium text-white tracking-tight leading-none">YOU</p>
                                <p className="font-dm text-xs text-white/45 mt-1.5">Home base</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center gap-2 mx-5 mb-1">
                                <div className="plane-bob"><Bus size={20} color="#F5836B" strokeWidth={2} /></div>
                                <div className="route-line w-full" />
                                {nights !== null && (
                                    <p className="font-dm text-[0.65rem] text-white/35 tracking-wide">{nights} night{nights !== 1 ? "s" : ""}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-[0.6rem] text-white/40 tracking-[.22em] uppercase mb-1">To</p>
                                <p className="font-mono text-5xl font-medium text-orange-400 tracking-tight leading-none">{itinerary.destination.slice(0, 3).toUpperCase()}</p>
                                <p className="font-dm text-xs text-white/55 mt-1.5 max-w-[130px] truncate text-right">{itinerary.destination}</p>
                            </div>
                        </div>
                    </div>

                    <div className="perforation relative h-0 border-t-2 border-dashed border-stone-200 bg-[#F7F2EC]" />

                    <div className="bg-white px-6 py-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 pb-5 border-b border-stone-100">
                            <div>
                                <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">Dates</p>
                                <p className="text-sm font-semibold text-stone-700 font-dm">{hasValidStart ? format(start, "dd MMM") : "Flexible dates"}</p>
                                <p className="text-xs text-stone-400 font-dm">→ {hasValidEnd ? format(end, "dd MMM yy") : "Flexible"}</p>
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">Travellers</p>
                                <div className="flex items-center gap-1.5">
                                    <Users size={13} className="text-stone-400" />
                                    <p className="text-sm font-semibold text-stone-700 font-dm capitalize">{itinerary.tripType}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">Transport</p>
                                <TransportBadge mode={itinerary.transportMode} />
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">Budget</p>
                                <div className="flex items-center gap-2">
                                    <BudgetDots budget={itinerary.budget} />
                                    <span className="text-sm font-semibold text-stone-700 font-dm capitalize">{itinerary.budget}</span>
                                </div>
                            </div>
                        </div>

                        {Array.isArray(itinerary.interests) && itinerary.interests.length > 0 && (
                            <div className="py-4 border-b border-stone-100">
                                <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-2.5">Trip Style</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {itinerary.interests.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center bg-orange-50 border border-orange-100 text-orange-600 text-[0.72rem] font-semibold font-dm px-2.5 py-1 rounded-lg tracking-wide capitalize">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(itinerary.plan) && itinerary.plan.length > 0 && (
                            <div className="pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={13} color="#E8694A" strokeWidth={2} />
                                        <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm">Itinerary — {itinerary.plan.length} days</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[0.65rem] text-stone-400 font-dm">
                                        <span>{hasValidStart ? format(start, "dd MMM yyyy") : ""}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {itinerary.plan.map((dayObj, idx) => (
                                        <DayCard key={`${id}-${idx}`} dayObj={dayObj} dayNumber={idx + 1} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItineraryPublicView;
