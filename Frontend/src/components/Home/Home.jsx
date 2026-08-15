import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import React from "react";
import {
  TrainFront,
  Bus,
  PlaneTakeoff,
  BookOpen,
  MapPin,
  Camera,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FaPlane, FaHotel } from "react-icons/fa";

const perforation =
  "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";

const dashedH =
  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)";

const StubDivider = () => (
  <div className="flex items-center my-10">
    <div className="w-6 h-6 rounded-full bg-orange-50 border-2 border-orange-200 -ml-3 flex-shrink-0" />
    <div className="flex-1 h-px mx-1" style={{ background: dashedH }} />
    <div className="w-6 h-6 rounded-full bg-orange-50 border-2 border-orange-200 -mr-3 flex-shrink-0" />
  </div>
);

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const services = [
    {
      icon: <TrainFront strokeWidth={1.5} />,
      title: "Train Booking",
      description: "Reserve your seats on Indian Railways. Easy and secure!",
      path: "/train",
      gate: "A1",
      code: "TRN",
      accent: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-700",
    },
    {
      icon: <Bus strokeWidth={1.5} />,
      title: "Bus Booking",
      description: "Book comfortable and affordable bus tickets in seconds.",
      path: "/bus",
      gate: "B2",
      code: "BUS",
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <PlaneTakeoff strokeWidth={1.5} />,
      title: "Flight Booking",
      description: "Compare flights, get deals, and fly to your dream places.",
      path: "/flight",
      gate: "C3",
      code: "FLT",
      accent: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-600",
    },
    {
      icon: <FaHotel className="w-7 h-7" />,
      title: "Hotel Booking",
      description: "Browse hotels and reserve rooms for your trip.",
      path: "/hotels",
      gate: "D4",
      code: "HTL",
      accent: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-200",
      badge: "bg-sky-100 text-sky-600",
    },
  ];

  const features = [
    {
      icon: <BookOpen size={22} strokeWidth={2} className="text-orange-500" />,
      title: "Manage Bookings",
      desc: "View your past, upcoming, and canceled journeys in one place.",
      tag: "BOOKINGS",
    },
    {
      icon: <MapPin size={22} strokeWidth={2} className="text-orange-500" />,
      title: "Full Itinerary",
      desc: "Track all your trip segments including stopovers and transfers.",
      tag: "ITINERARY",
    },
    {
      icon: <Camera size={22} strokeWidth={2} className="text-orange-500" />,
      title: "Travel Diary",
      desc: "Save pictures and notes to remember your travel experiences.",
      tag: "DIARY",
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50 text-stone-800 pt-7">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-stone-900 py-16 sm:py-24 px-4 sm:px-6 text-center">
        {/* Top perforation */}
        <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: perforation }} />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6 text-center flex-wrap justify-center">
            <Sparkles size={14} className="text-orange-400" />
            <span className="text-xs sm:text-sm text-orange-300 font-semibold tracking-wide uppercase">
              Your Journey Begins Here
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-3 sm:mb-4 leading-tight sm:leading-none uppercase tracking-tight break-words">
            Welcome to{" "}
            <span className="text-orange-400">TripUp</span>
          </h1>

          {/* Flight route display */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 my-4 sm:my-6">
            <div className="text-center">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-0.5">From</p>
              <p className="font-black text-2xl sm:text-3xl text-white tracking-widest">HME</p>
              <p className="text-xs text-stone-500">Home Base</p>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-1">
              <FaPlane className="text-orange-400 text-xl" />
              <div className="h-px w-20" style={{ background: dashedH }} />
              <p className="text-xs text-stone-500 tracking-widest uppercase">nonstop</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-0.5">To</p>
              <p className="font-black text-2xl sm:text-3xl text-orange-400 tracking-widest">WORLD</p>
              <p className="text-xs text-stone-500">Everywhere</p>
            </div>
          </div>

          <p className="text-stone-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed px-2">
            Your one-stop platform for booking tickets, planning itineraries, and
            recording your travel moments — via Train, Bus, or Flight.
          </p>

          <Link
            to="/itinerary"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-black tracking-widest uppercase transition-all shadow-lg"
          >
            Create Your Plan
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Bottom perforation */}
        <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ background: perforation }} />
      </section>

      {/* ── SERVICES ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2">
            — Departure Gates —
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-wide">
            Book with TripUp
          </h2>
          <p className="text-stone-400 mt-2 text-sm sm:text-base">Choose your preferred mode of travel</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {services.map((service, idx) => (
            <Link
              to={service.path}
              key={idx}
              className={`group relative bg-white border-2 ${service.border} rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}
            >
              {/* Top perforation accent */}
              <div className="h-1 w-full" style={{ background: perforation }} />

              {/* Gate tag */}
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

              {/* Content */}
              <div className="px-5 py-5 flex-1">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${service.bg} ${service.accent} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(service.icon, { className: "w-7 h-7", strokeWidth: 1.5 })}
                </div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-wide mb-2">
                  {service.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className={`inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wide ${service.accent} group-hover:gap-3 transition-all`}>
                  Book Now
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Bottom barcode stub */}
              <div className="bg-stone-900 px-5 py-3 flex items-end gap-px h-10">
                {[2, 1, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 1, 3, 2, 1, 2, 3].map((w, i) => (
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
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-4 sm:py-4 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Full-width stub divider */}
        <div className="flex items-center mb-8 sm:mb-12">
          <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-1 flex-shrink-0" />
          <div className="flex-1 h-px" style={{ background: dashedH }} />
          <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-1 flex-shrink-0" />
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2">
            — Amenities on Board —
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 uppercase tracking-wide">
            What You Can Do
          </h2>
          <p className="text-stone-400 mt-2 text-sm sm:text-base">Explore all the features TripUp offers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-orange-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-1 w-full" style={{ background: perforation }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-orange-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-black tracking-widest text-stone-300 uppercase">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-stone-900 uppercase tracking-wide mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      {!isAuthenticated && (
        <section className="relative mt-12 sm:mt-16 overflow-hidden bg-stone-900 py-12 sm:py-20 px-4 sm:px-6 text-center">
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: perforation }} />

          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 max-w-xl mx-auto">
            <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2 sm:mb-3">
              — Final Call —
            </p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-3 sm:mb-4 leading-tight sm:leading-none">
              Start Your Journey Now
            </h2>
            <p className="text-stone-400 mb-6 sm:mb-8 text-sm sm:text-base px-2">
              Join thousands of travelers exploring the world with TripUp.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-black tracking-widest uppercase transition-all shadow-lg"
            >
              Sign Up Free
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Barcode */}
          <div className="flex justify-center items-end gap-px h-6 sm:h-8 mt-8 sm:mt-12 opacity-20">
            {[3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
              <div
                key={i}
                className="bg-white rounded-sm"
                style={{
                  width: `${w * 3}px`,
                  height: `${55 + (i % 3) * 18}%`,
                }}
              />
            ))}
          </div>
          <p className="text-xs tracking-widest text-stone-600 uppercase font-semibold mt-2">
            TRIPUP · YDP
          </p>

          <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ background: perforation }} />
        </section>
      )}
    </div>
  );
};

export default Home;