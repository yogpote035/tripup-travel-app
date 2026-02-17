import { TrainFront, Bus, PlaneTakeoff, History, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";
import { useSelector } from "react-redux";
import { FaPlane } from "react-icons/fa";

const perforation =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";
const dashedH =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const services = [
  {
    icon: TrainFront,
    title: "Train Booking",
    path: "/train-bookings",
    gate: "A1",
    code: "TRN",
    description: "View your train journey history",
    accent: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Bus,
    title: "Bus Booking",
    path: "/bus-bookings",
    gate: "B2",
    code: "BUS",
    description: "View your bus journey history",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: PlaneTakeoff,
    title: "Flight Booking",
    path: "/flight-bookings",
    gate: "C3",
    code: "FLT",
    description: "View your flight journey history",
    accent: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-600",
  },
];

const Bookings = () => {
  const { loading, error } = useSelector((state) => state.train);

  if (loading)
    return <Loading message="Fetching Your Journey's and Revise Your Moments" />;

  if (error)
    return (
      <p className="text-center text-red-400 mt-10 text-lg font-medium">{error}</p>
    );

  return (
    <div className="min-h-screen bg-orange-50 pt-7">

      {/* ── HERO HEADER ── */}
      <section className="relative bg-stone-900 py-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: perforation }} />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-4 py-2 mb-6">
            <History size={14} className="text-orange-400" />
            <span className="text-xs text-orange-300 font-black tracking-widest uppercase">
              Your Travel Records
            </span>
          </div>

          {/* Flight route display */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-0.5">Passenger</p>
              <p className="font-black text-2xl text-white tracking-widest">YOU</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FaPlane className="text-orange-400 text-lg" />
              <div className="h-px w-16" style={{ background: dashedH }} />
              <p className="text-xs text-stone-500 tracking-widest uppercase">history</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-0.5">Destination</p>
              <p className="font-black text-2xl text-orange-400 tracking-widest">WORLD</p>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide leading-none mb-3">
            History of Your <span className="text-orange-400">Journey</span>
          </h1>
          <p className="text-stone-400 text-base">
            Explore all your past bookings and travel memories
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ background: perforation }} />
      </section>

      {/* ── STAMP AVATAR ── */}
      <section className="flex justify-center -mt-10 relative z-10 mb-4">
        <div className="relative">
          <div className="w-36 h-36 rounded-full border-4 border-dashed border-orange-300 bg-white shadow-xl flex items-center justify-center overflow-hidden">
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ4cXE3YmRhc2I4Ymh2cmxkcjk4djg1a3RjNHQ5ZXJrZHplajg3ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uY4CJ1kPx3gxpn9HD5/giphy.gif"
              alt="Travel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-xs font-black tracking-widest text-orange-600 uppercase bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
              VERIFIED ✓
            </span>
          </div>
        </div>
      </section>

      {/* ── STUB TEAR LINE ── */}
      <div className="flex items-center px-6 max-w-6xl mx-auto mt-8 mb-10">
        <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 flex-shrink-0" />
        <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
        <span className="text-xs font-black tracking-widest text-stone-400 uppercase px-3 whitespace-nowrap">
          Departure Gates
        </span>
        <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
        <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 flex-shrink-0" />
      </div>

      {/* ── SERVICE CARDS ── */}
      <section className="pb-16 px-6 max-w-6xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Link
                to={service.path}
                key={idx}
                className={`group relative bg-white border-2 ${service.border} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col`}
              >
                {/* Top perforation */}
                <div className="h-1 w-full" style={{ background: perforation }} />

                {/* Gate + code row */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <span className={`text-xs font-black tracking-widest uppercase ${service.accent}`}>
                    GATE {service.gate}
                  </span>
                  <span className={`text-xs font-black tracking-widest px-2 py-0.5 rounded-full ${service.badge}`}>
                    {service.code}
                  </span>
                </div>

                {/* Dashed divider */}
                <div className="mx-5 h-px" style={{ background: dashedH }} />

                {/* Body */}
                <div className="px-5 py-5 flex-1 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.bg} ${service.accent} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={30} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-lg font-black text-stone-900 uppercase tracking-wide mb-1">
                    {service.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wide ${service.accent} group-hover:gap-3 transition-all`}>
                    View History
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Barcode footer */}
                <div className="bg-stone-900 px-5 py-2.5 flex items-end gap-px h-9">
                  {[2,1,3,1,2,1,3,2,1,2,1,3,1,2,1,3,2,1,2,3,1,2].map((w, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-sm"
                      style={{
                        width: `${w * 2.5}px`,
                        height: `${50 + (i % 3) * 20}%`,
                        opacity: 0.1 + (i % 4) * 0.2,
                      }}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Bookings;