import { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Wallet,
  Bus,
  Car,
  Footprints,
  Trash,
  MapPin,
  Sparkles,
  Plus,
  AlertTriangle,
  Clock,
  ChevronDown,
  Plane,
  ArrowRight,
  Copy,
  RefreshCw,
  Share2,
  Search,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllItinerary,
  DeleteItinerary,
  duplicateItinerary,
  shareItinerary,
  regenerateDay,
} from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";
import { format } from "date-fns";

// ─── Styles ───────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-dm    { font-family: 'DM Sans', sans-serif; }
    .font-mono  { font-family: 'DM Mono', monospace; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes planeBob { 0%{transform:translateX(-4px)} 50%{transform:translateX(4px)} 100%{transform:translateX(-4px)} }
    @keyframes shimmer  { to { background-position: 200% center; } }

    .anim-up    { animation: fadeUp  .4s ease both; }
    .anim-fade  { animation: fadeIn  .22s ease; }
    .anim-slide { animation: slideUp .3s cubic-bezier(.34,1.56,.64,1); }
    .plane-bob  { animation: planeBob 2.4s ease-in-out infinite; }

    .ticket-card { transition: box-shadow .3s ease, transform .3s ease; }
    .ticket-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 64px rgba(26,18,8,.13), 0 8px 24px rgba(232,105,74,.10) !important;
    }

    .perforation { position: relative; }
    .perforation::before,
    .perforation::after {
      content: '';
      position: absolute;
      width: 22px; height: 22px;
      background: #F7F2EC;
      border-radius: 50%;
      top: 50%; transform: translateY(-50%);
      z-index: 10;
    }
    .perforation::before { left: -11px; }
    .perforation::after  { right: -11px; }

    .route-line {
      flex: 1; height: 1.5px;
      background: repeating-linear-gradient(90deg,rgba(255,255,255,.25) 0px,rgba(255,255,255,.25) 5px,transparent 5px,transparent 10px);
    }

    .badge-shimmer {
      background: linear-gradient(135deg, #E8694A 0%, #F5836B 50%, #E8694A 100%);
      background-size: 200% auto;
      animation: shimmer 3s linear infinite;
    }

    .day-wrap { transition: border-color .2s, box-shadow .2s; }
    .day-wrap:hover { border-color: #F5C4B8 !important; box-shadow: 0 2px 16px rgba(232,105,74,.10); }

    .chev { transition: transform .25s ease; }
    .chev-open { transform: rotate(180deg); }

    .act-row { border-bottom: 1px dashed #F0E8DF; }
    .act-row:last-child { border-bottom: none; }

    .del-btn { transition: all .2s ease; }
    .del-btn:hover {
      background: rgba(239,68,68,.12) !important;
      border-color: rgba(239,68,68,.4) !important;
      transform: scale(1.1);
    }
  `}</style>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const destCode = (name = "") => {
  const w = name.trim().split(/\s+/);
  if (w.length >= 3) return (w[0][0] + w[1][0] + w[2][0]).toUpperCase();
  if (w.length === 2) return (w[0].slice(0, 2) + w[1][0]).toUpperCase();
  return name.slice(0, 3).toUpperCase();
};

// ─── Day Card ─────────────────────────────────────────────────────────────────
const DayCard = memo(({ dayObj, dayNumber }) => {
  const [open, setOpen] = useState(false);
  const safeDate = dayObj?.date ? new Date(dayObj.date) : null;
  const hasValidDate =
    safeDate instanceof Date && !Number.isNaN(safeDate.getTime());
  // Normalize activities: accept explicit array, arrays stored as plan entry, or numeric-keyed objects
  let activities = [];
  if (Array.isArray(dayObj?.activities)) activities = dayObj.activities;
  else if (Array.isArray(dayObj)) activities = dayObj;
  else if (dayObj && typeof dayObj === "object") {
    // Collect string values (handles objects like { '0': '...', '1': '...' })
    activities = Object.values(dayObj).filter((v) => typeof v === "string");
  }

  return (
    <div className="day-wrap bg-white border border-stone-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left
          bg-stone-50 hover:bg-orange-50/40 transition-colors duration-200
          ${open ? "border-b border-stone-100" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
            bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold font-mono
            shadow-[0_2px_8px_rgba(232,105,74,0.28)]"
          >
            {String(dayNumber).padStart(2, "0")}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700 font-dm leading-tight">
              Day {dayNumber}
            </p>
            <p className="text-xs text-stone-400 font-dm mt-0.5">
              {hasValidDate
                ? format(safeDate, "EEE, dd MMM yyyy")
                : "Flexible day plan"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-dm text-stone-400">
            {dayObj.activities?.length} activities
          </span>
          <ChevronDown
            size={15}
            className={`chev text-stone-400 ${open ? "chev-open" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 py-1 bg-white">
          {activities.length > 0 ? (
            activities.map((act, i) => (
              <div
                key={i}
                className="act-row flex items-start gap-3 py-3 text-sm text-stone-500 font-dm leading-relaxed"
              >
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span>{act}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-stone-400 py-3">
              No activities listed for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ─── Transport Badge ──────────────────────────────────────────────────────────
const TransportBadge = ({ mode }) => {
  const MAP = {
    public: { icon: <Bus size={10} />, label: "Public" },
    walking: { icon: <Footprints size={10} />, label: "Walking" },
    private: { icon: <Car size={10} />, label: "Private" },
  };
  const item = MAP[mode];
  if (!item) return null;
  return (
    <div
      className="inline-flex items-center gap-1 bg-stone-100 text-stone-600
      text-[0.68rem] font-semibold font-dm px-2.5 py-1 rounded-md tracking-wide"
    >
      {item.icon} {item.label}
    </div>
  );
};

// ─── Budget Dots ──────────────────────────────────────────────────────────────
const BudgetDots = ({ budget }) => {
  const level = { low: 1, medium: 2, high: 3 }[budget?.toLowerCase()] || 1;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? "bg-orange-400" : "bg-stone-200"}`}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
const Itinerary = () => {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busyId, setBusyId] = useState("");
  const [regenDay, setRegenDay] = useState("");
  const itineraries = useSelector((s) => s.itinerary.itinerary);
  const { loading, error } = useSelector((s) => s.itinerary);


  const fetchAll = () => dispatch(getAllItinerary());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    dispatch(getAllItinerary(1, 10, false, debouncedSearch)).then((payload) => {
      if (payload && payload.pages) setHasMore(1 < payload.pages);
      else setHasMore(false);
    });
    setPage(1);
  }, [dispatch, debouncedSearch]);

  // load more when page changes (page > 1)
  useEffect(() => {
    if (page > 1) {
      dispatch(getAllItinerary(page, 10, true, debouncedSearch))
        .then((payload) => {
          if (payload && payload.pages) setHasMore(page < payload.pages);
          else setHasMore(false);
        })
        .catch(() => setHasMore(false));
    }
  }, [page, dispatch]);
  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  // Infinite scroll sentinel observer
  useEffect(() => {
    const sentinel = document.getElementById("itinerary-list-sentinel");
    if (!sentinel) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading) {
            setPage((p) => p + 1);
          }
        });
        DayCard.displayName = "DayCard";
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loading]);



  // render a single itinerary card (extracted to reuse for virtualization)
  const renderItineraryCard = (itin, idx, style = {}) => {
    const code = destCode(itin.destination);
    const from = itin.origin ? itin.origin : "YOU";
    const start = itin.startDate ? new Date(itin.startDate) : null;
    const end = itin.endDate ? new Date(itin.endDate) : null;
    const created = itin.createdAt ? new Date(itin.createdAt) : null;
    const hasValidStart = start && !Number.isNaN(start.getTime());
    const hasValidEnd = end && !Number.isNaN(end.getTime());
    const hasValidCreated = created && !Number.isNaN(created.getTime());
    const nights =
      hasValidStart && hasValidEnd
        ? Math.round((end - start) / 86400000)
        : null;

    return (
      <div
        key={itin._id}
        style={style}
        className="ticket-card anim-up rounded-3xl overflow-hidden
                    shadow-[0_6px_24px_rgba(26,18,8,.08),0_2px_8px_rgba(26,18,8,.04)]
                    border border-stone-100"
      >
        {/* TOP + BODY (same structure as before) */}
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pt-5 pb-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="badge-shimmer text-white text-[0.62rem] font-bold tracking-[.14em] uppercase px-3 py-1 rounded-full font-dm">
                ✦ AI Generated
              </div>
              <div className="bg-emerald-500/20 text-emerald-400 text-[0.62rem] font-bold tracking-[.10em] uppercase px-2.5 py-1 rounded-full font-dm border border-emerald-500/30">
                Confirmed
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDuplicate(itin._id)}
                className="flex items-center justify-center w-9 h-9 bg-white/10 border border-white/20 rounded-xl text-white/70 hover:bg-white/20 transition-all duration-200"
                title="Duplicate itinerary"
              >
                <Copy size={14} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => handleShare(itin._id)}
                className="flex items-center justify-center w-9 h-9 bg-white/10 border border-white/20 rounded-xl text-white/70 hover:bg-white/20 transition-all duration-200"
                title="Share itinerary"
              >
                <Share2 size={14} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(itin._id);
                  setShowConfirm(true);
                }}
                className="del-btn flex items-center justify-center w-9 h-9 bg-white/10 border border-white/20 rounded-xl text-white/60 cursor-pointer transition-all duration-200"
              >
                <Trash size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          <div className="relative flex items-end justify-between">
            <div>
              <p className="font-mono text-[0.6rem] text-white/40 tracking-[.22em] uppercase mb-1">
                From
              </p>
              <p className="font-mono text-5xl font-medium text-white tracking-tight leading-none">
                {from.slice(0, 3).toUpperCase()}
              </p>
              <p className="font-dm text-xs text-white/45 mt-1.5 truncate max-w-[120px]">
                {from}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 mx-5 mb-1">
              <div className="plane-bob">
                <Plane size={20} color="#F5836B" strokeWidth={2} />
              </div>
              <div className="route-line w-full" />
              {nights !== null && (
                <p className="font-dm text-[0.65rem] text-white/35 tracking-wide">
                  {nights} night{nights !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-mono text-[0.6rem] text-white/40 tracking-[.22em] uppercase mb-1">
                To
              </p>
              <p className="font-mono text-5xl font-medium text-orange-400 tracking-tight leading-none">
                {code}
              </p>
              <p className="font-dm text-xs text-white/55 mt-1.5 max-w-[130px] truncate text-right">
                {itin.destination}
              </p>
            </div>
          </div>
        </div>

        <div className="perforation relative h-0 border-t-2 border-dashed border-stone-200 bg-[#F7F2EC]" />

        <div className="bg-white px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 pb-5 border-b border-stone-100">
            <div>
              <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">
                Dates
              </p>
              <p className="text-sm font-semibold text-stone-700 font-dm">
                {hasValidStart ? format(start, "dd MMM") : "Flexible dates"}
              </p>
              <p className="text-xs text-stone-400 font-dm">
                → {hasValidEnd ? format(end, "dd MMM yy") : "Flexible"}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">
                Travellers
              </p>
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-stone-400" />
                <p className="text-sm font-semibold text-stone-700 font-dm capitalize">
                  {itin.tripType}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">
                Transport
              </p>
              <TransportBadge mode={itin.transportMode} />
            </div>
            <div>
              <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1.5">
                Budget
              </p>
              <div className="flex items-center gap-2">
                <BudgetDots budget={itin.budget} />
                <span className="text-sm font-semibold text-stone-700 font-dm capitalize">
                  {itin.budget}
                </span>
              </div>
            </div>
          </div>

          {itin?.interests?.length > 0 && (
            <div className="py-4 border-b border-stone-100">
              <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-2.5">
                Trip Style
              </p>
              <div className="flex flex-wrap gap-1.5">
                {itin.interests.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center bg-orange-50 border border-orange-100 text-orange-600 text-[0.72rem] font-semibold font-dm px-2.5 py-1 rounded-lg tracking-wide capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {itin?.plan?.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={13} color="#E8694A" strokeWidth={2} />
                  <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm">
                    Itinerary — {itin.plan.length} days
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[0.65rem] text-stone-400 font-dm">
                  <Clock size={10} />
                  {hasValidCreated ? format(created, "dd MMM yyyy") : "-"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {Array.isArray(itin.plan) &&
                  itin.plan.map((dayObj, index) => {
                    const dayNumber = Number(dayObj?.day ?? index + 1);
                    const uniqueKey = `${itin._id}-${index}-${dayNumber}`;
                    const dayDate = dayObj?.date || null;
                    return (
                      <div key={uniqueKey} className="flex flex-col gap-2">
                        <DayCard dayObj={dayObj} dayNumber={dayNumber} />
                        <button
                          type="button"
                          onClick={() =>
                            handleRegenerateDay(itin._id, dayNumber, dayDate)
                          }
                          disabled={busyId === itin._id}
                          className="self-start inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-600 hover:bg-orange-100 transition-all"
                        >
                          <RefreshCw
                            size={12}
                            className={
                              busyId === itin._id ? "animate-spin" : ""
                            }
                          />
                          Regenerate this day
                        </button>
                      </div>
                    );
                  })}
                <div id="itinerary-list-sentinel" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const handleDuplicate = async (id) => {
    setBusyId(id);
    setActionMsg("Duplicating itinerary…");
    try {
      await dispatch(duplicateItinerary(id));
    } finally {
      setBusyId("");
      setActionMsg("");
    }
  };

  const handleShare = async (id) => {
    setBusyId(id);
    setActionMsg("Creating share link…");
    try {
      const result = await dispatch(shareItinerary(id));
      if (!result?.success && result?.error) {
        toast.error(result.error);
      }
    } finally {
      setBusyId("");
      setActionMsg("");
    }
  };

  const handleRegenerateDay = async (id, dayNumber, date = null) => {
    if (!id) return toast.warn("Itinerary id missing");
    if (
      dayNumber === undefined ||
      dayNumber === null ||
      Number.isNaN(Number(dayNumber))
    ) {
      return toast.warn("Invalid day number — cannot regenerate");
    }
    setBusyId(id);
    setActionMsg("Regenerating itinerary day…");
    try {
      await dispatch(regenerateDay(id, Number(dayNumber), date));
    } finally {
      setBusyId("");
      setActionMsg("");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.warn("Itinerary Id Missing");
    setActionMsg("Deleting itinerary…");
    try {
      await dispatch(DeleteItinerary(selectedId));
      setShowConfirm(false);
      setTimeout(() => fetchAll(), 1300);
    } catch {
      alert("Failed to delete.");
    }
  };

  if (loading)
    return (
      <Loading
        message={actionMsg || "Fetching your itineraries…"}
        color="border-t-orange-400"
      />
    );

  return (
    <div
      className="itinerary-experience min-h-screen font-dm pb-24"
    >
      <FontLoader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ── Hero ── */}
        <div className="pt-10 pb-10 anim-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-orange-300" />
            <span className="text-[0.68rem] font-bold tracking-[.18em] uppercase text-orange-400 font-dm">
              My Itinerary's
            </span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1
                className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.05]
                tracking-tight text-stone-900"
              >
                Your Travel
                <br />
                <em className="text-orange-500">Itineraries</em>
              </h1>
              <p className="text-stone-500 text-sm font-light mt-3 max-w-sm leading-relaxed font-dm">
                AI-crafted day-by-day plans tailored to your style, pace, and
                budget.
              </p>
              <div className="mt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDebouncedSearch(search.trim());
                  }}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm p-3 max-w-2xl"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                      <input
                        role="search"
                        aria-label="Search itineraries"
                        placeholder="Search by origin, destination, or interests"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                    >
                      Search
                    </button>
                    {search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setDebouncedSearch("");
                        }}
                        className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              {itineraries?.length > 0 && (
                <div className="flex items-center gap-4 mr-2">
                  <div className="text-center">
                    <p className="font-mono text-3xl font-medium text-stone-800">
                      {itineraries.length}
                    </p>
                    <p className="text-xs text-stone-400 font-dm mt-0.5">
                      Trips planned
                    </p>
                  </div>
                  <div className="w-px h-10 bg-stone-200" />
                  <div className="text-center">
                    <p className="font-mono text-3xl font-medium text-orange-500">
                      {itineraries.reduce(
                        (acc, it) => acc + (it.plan?.length || 0),
                        0,
                      )}
                    </p>
                    <p className="text-xs text-stone-400 font-dm mt-0.5">
                      Days mapped
                    </p>
                  </div>
                </div>
              )}

              {/* New Trip CTA */}
              <Link to="/itinerary-fill">
                <button
                  className="inline-flex items-center gap-2 font-dm font-semibold text-sm text-white
                  bg-gradient-to-br from-orange-400 to-orange-600 px-5 py-2.5 rounded-xl
                  shadow-[0_4px_14px_rgba(232,105,74,.28)]
                  hover:shadow-[0_8px_22px_rgba(232,105,74,.36)]
                  hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Plan new Trip
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200
            text-red-600 text-sm font-dm px-4 py-3.5 rounded-2xl"
          >
            <AlertTriangle size={17} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* ══════════════════════════════════
            TICKET CARDS
        ══════════════════════════════════ */}
        {itineraries?.length > 0 ? (
          <div className="flex flex-col gap-6">
            {itineraries.map((itin, idx) => renderItineraryCard(itin, idx))}

            {/* Bottom CTA */}
            <div className="text-center pt-2 pb-4">
              <Link to="/itinerary-fill">
                <button
                  className="inline-flex items-center gap-2 font-dm font-medium text-sm
                  text-orange-500 border-[1.5px] border-orange-200 bg-white
                  px-6 py-3 rounded-full hover:bg-orange-50
                  hover:border-orange-300 transition-all duration-200"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Plan Another Trip
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="text-center py-24">
            <div className="inline-block relative mb-8">
              <div
                className="w-64 h-32 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl
                flex items-center justify-center shadow-[0_8px_32px_rgba(26,18,8,.20)] overflow-hidden relative"
              >
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
                <div className="relative text-center">
                  <Plane
                    size={28}
                    color="#F5836B"
                    className="mx-auto mb-2 plane-bob"
                    strokeWidth={1.8}
                  />
                  <p className="font-mono text-white/40 text-xs tracking-[.2em]">
                    NO TRIPS YET
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-3 left-6 right-6 h-0 border-t-2 border-dashed border-stone-300" />
              <div className="absolute bottom-0 left-6 right-6 h-3 bg-stone-50 rounded-b-xl border border-t-0 border-stone-200" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-stone-800 mb-2">
              No trips booked yet
            </h2>
            <p className="text-stone-400 text-sm font-dm font-light mb-8 max-w-xs mx-auto">
              Your next adventure is just one click away. Let AI plan the
              perfect trip for you.
            </p>
            <Link to="/itinerary-fill">
              <button
                className="inline-flex items-center gap-2 font-dm font-semibold text-sm text-white
                bg-gradient-to-br from-orange-400 to-orange-600 px-7 py-3.5 rounded-full
                shadow-[0_8px_24px_rgba(232,105,74,.28)]
                hover:shadow-[0_14px_34px_rgba(232,105,74,.38)]
                hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <Plane size={15} strokeWidth={2.2} />
                Plan My First Trip
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade"
          style={{
            background: "rgba(26,18,8,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm
              shadow-[0_24px_80px_rgba(26,18,8,.22)] anim-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <AlertTriangle size={24} color="#E05C3E" strokeWidth={2} />
            </div>
            <p className="text-[0.6rem] font-bold tracking-[.16em] uppercase text-stone-400 font-dm mb-1">
              Cancel Booking
            </p>
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2 tracking-tight">
              Delete this trip?
            </h3>
            <p className="text-stone-500 text-sm font-dm font-light leading-relaxed mb-7">
              This itinerary will be permanently removed. This action cannot be
              undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border-[1.5px] border-stone-200 bg-white
                  text-stone-600 text-sm font-semibold font-dm
                  hover:bg-stone-50 transition-all duration-200"
              >
                Keep Trip
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold font-dm
                  bg-gradient-to-br from-red-500 to-red-700
                  shadow-[0_4px_14px_rgba(192,57,27,.26)]
                  hover:shadow-[0_8px_22px_rgba(192,57,27,.34)]
                  hover:-translate-y-px active:translate-y-0 transition-all duration-200"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itinerary;
