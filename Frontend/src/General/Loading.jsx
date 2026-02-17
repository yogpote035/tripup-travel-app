import { useEffect, useState } from "react";

const Loading = ({ message = "Loading...", color = "border-t-orange-500" }) => {

  const steps = [
    { icon: "🔍", label: "Analysing Preferences"    },
    { icon: "🗺️", label: "Plotting Route"            },
    { icon: "🏨", label: "Curating Stays"            },
    { icon: "🍽️", label: "Finding Experiences"       },
    { icon: "✨", label: "Finalising Itinerary"      },
  ];

  const destinations = [
    { code: "NRT", city: "Tokyo",    country: "Japan",        emoji: "🗼", color: "#E8694A" },
    { code: "CDG", city: "Paris",    country: "France",       emoji: "🗼", color: "#C9A87C" },
    { code: "DXB", city: "Dubai",    country: "UAE",          emoji: "🏙️", color: "#E8694A" },
    { code: "BAL", city: "Bali",     country: "Indonesia",    emoji: "🌴", color: "#4A9E6B" },
    { code: "JFK", city: "New York", country: "United States",emoji: "🗽", color: "#5B8DD9" },
    { code: "SYD", city: "Sydney",   country: "Australia",    emoji: "🦘", color: "#E8694A" },
  ];

  const [stepIdx,   setStepIdx]   = useState(0);
  const [stepIn,    setStepIn]    = useState(true);
  const [destIdx,   setDestIdx]   = useState(0);
  const [destIn,    setDestIn]    = useState(true);
  const [progress,  setProgress]  = useState(0);
  const [dots,      setDots]      = useState(0);

  // Cycle steps
  useEffect(() => {
    const iv = setInterval(() => {
      setStepIn(false);
      setTimeout(() => { setStepIdx(i => (i + 1) % steps.length); setStepIn(true); }, 300);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  // Cycle destinations
  useEffect(() => {
    const iv = setInterval(() => {
      setDestIn(false);
      setTimeout(() => { setDestIdx(i => (i + 1) % destinations.length); setDestIn(true); }, 250);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  // Smooth progress
  useEffect(() => {
    const target = ((stepIdx + 1) / steps.length) * 100;
    const iv = setInterval(() => {
      setProgress(p => { const n = p + (target - p) * 0.06; return Math.abs(n - target) < 0.4 ? target : n; });
    }, 16);
    return () => clearInterval(iv);
  }, [stepIdx]);

  // Animate dots counter
  useEffect(() => {
    const iv = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(iv);
  }, []);

  const dest = destinations[destIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .f-serif { font-family: 'Cormorant Garamond', serif; }
        .f-dm    { font-family: 'DM Sans', sans-serif; }
        .f-mono  { font-family: 'DM Mono', monospace; }

        /* ─ Page fade in ─ */
        @keyframes pageIn { from{opacity:0} to{opacity:1} }
        .page-in { animation: pageIn .5s ease both; }

        /* ─ Slide up ─ */
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .slide-up   { animation: slideUp .5s cubic-bezier(.34,1.4,.64,1) both; }
        .delay-1    { animation-delay: .1s; }
        .delay-2    { animation-delay: .2s; }
        .delay-3    { animation-delay: .35s; }
        .delay-4    { animation-delay: .5s; }

        /* ─ Destination card swap ─ */
        .dest-in  { opacity:1; transform:translateY(0)    scale(1);   transition: opacity .25s ease, transform .25s ease; }
        .dest-out { opacity:0; transform:translateY(10px) scale(.97); transition: opacity .25s ease, transform .25s ease; }

        /* ─ Step label swap ─ */
        .step-in  { opacity:1; transform:translateX(0);    transition: all .3s ease; }
        .step-out { opacity:0; transform:translateX(-10px); transition: all .3s ease; }

        /* ─ Plane on SVG path ─ */
        @keyframes movePlane {
          0%   { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .plane-path {
          offset-path: path('M 20 60 Q 120 10 220 60');
          animation: movePlane 2.4s cubic-bezier(.4,0,.2,1) infinite;
          offset-rotate: auto;
        }

        /* ─ Arc draw ─ */
        @keyframes drawArc {
          from { stroke-dashoffset: 240; }
          to   { stroke-dashoffset: 0; }
        }
        .arc-draw {
          stroke-dasharray: 240;
          animation: drawArc 2.4s cubic-bezier(.4,0,.2,1) infinite;
        }

        /* ─ Progress shimmer ─ */
        @keyframes progShim {
          0%  { background-position: -200% 0; }
          100%{ background-position:  200% 0; }
        }
        .prog-fill {
          background: linear-gradient(90deg, #D44F30 0%, #E8694A 40%, #FFB36B 50%, #E8694A 60%, #D44F30 100%);
          background-size: 200% auto;
          animation: progShim 1.8s linear infinite;
          transition: width .6s cubic-bezier(.4,0,.2,1);
        }

        /* ─ Glow pulse on icon ─ */
        @keyframes glowPulse {
          0%,100%{ box-shadow: 0 0 0 0 rgba(232,105,74,.45); }
          50%    { box-shadow: 0 0 0 14px rgba(232,105,74,.0); }
        }
        .glow-icon { animation: glowPulse 2s ease-in-out infinite; }

        /* ─ Pin bounce ─ */
        @keyframes pinBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .pin-bounce { animation: pinBounce 1.8s ease-in-out infinite; }

        /* ─ Orbit ring ─ */
        @keyframes spinRing  { to{transform:rotate(360deg)}  }
        @keyframes spinRingR { to{transform:rotate(-360deg)} }
        .ring-1 { animation: spinRing  5s linear infinite; }
        .ring-2 { animation: spinRingR 3.5s linear infinite; }

        /* ─ Dot pulse ─ */
        @keyframes dotPulse { 0%,100%{opacity:.3;transform:scaleX(.6)} 50%{opacity:1;transform:scaleX(1)} }
        .dot-1 { animation: dotPulse 1.5s ease .0s  infinite; }
        .dot-2 { animation: dotPulse 1.5s ease .18s infinite; }
        .dot-3 { animation: dotPulse 1.5s ease .36s infinite; }

        /* ─ Card list scroll ─ */
        @keyframes cardScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .card-scroll-track { animation: cardScroll 14s linear infinite; }

        /* ─ Number count ─ */
        @keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .count-up { animation: countUp .35s ease both; }

        /* ─ Fade bg ─ */
        @keyframes bgPulse { 0%,100%{opacity:.07} 50%{opacity:.13} }
        .bg-pulse { animation: bgPulse 4s ease-in-out infinite; }

        /* ─ Tag float ─ */
        @keyframes tagFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .tag-float   { animation: tagFloat 3s ease-in-out infinite; }
        .tag-float-d { animation: tagFloat 3s ease-in-out 1s infinite; }
      `}</style>

      {/* ══════════════════════════════════════════════
          FULL SCREEN
      ══════════════════════════════════════════════ */}
      <div className="page-in fixed inset-0 z-50 f-dm overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F0D0A 0%, #1A1410 50%, #0F0D0A 100%)" }}>

        {/* ── Subtle grid overlay ── */}
        <div className="absolute inset-0 bg-pulse"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

        {/* ── Radial glow blobs ── */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,105,74,.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,168,124,.06) 0%, transparent 70%)" }} />

        {/* ══ LAYOUT: two columns on desktop, stacked on mobile ══ */}
        <div className="relative h-full flex flex-col lg:flex-row">

          {/* ── LEFT: Main loading panel ── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:py-0">

            {/* ─ Globe + orbit ─ */}
            <div className="slide-up relative flex items-center justify-center mb-8">
              {/* Outer glow */}
              <div className="absolute w-40 h-40 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(232,105,74,.12) 0%, transparent 70%)" }} />

              {/* Orbit rings */}
              <div className="absolute w-32 h-32 ring-1"
                style={{ border: "1px solid rgba(232,105,74,.15)", borderRadius: "50%", transform: "rotateX(72deg)" }} />
              <div className="absolute w-28 h-28 ring-2"
                style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: "50%", transform: "rotateX(60deg) rotateY(40deg)" }} />

              {/* Globe core */}
              <div className="glow-icon relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(135deg at 35% 35%, #2A2010, #14100A)",
                  border: "1.5px solid rgba(232,105,74,.25)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 0 40px rgba(232,105,74,.15)",
                }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(245,131,107,.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M6.3 7h11.4M6.3 17h11.4" opacity=".4"/>
                </svg>
              </div>

              {/* Orbiting dot */}
              <div className="absolute w-32 h-32 flex items-center justify-center"
                style={{ animation: "spinRing 3s linear infinite" }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-3 h-3 rounded-full text-[9px] flex items-center justify-center
                  shadow-[0_0_8px_rgba(232,105,74,.7)]"
                  style={{ background: "linear-gradient(135deg,#E8694A,#D44F30)" }}>
                  ✈
                </div>
              </div>
            </div>

            {/* ─ Main message ─ */}
            <div className="slide-up delay-1 text-center mb-2">
              <p className="f-mono text-[0.58rem] tracking-[.22em] uppercase text-white/30 mb-3">
                AI Travel Planner
              </p>
              <h2 className="f-serif text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-white leading-tight tracking-tight">
                {message}
              </h2>
            </div>

            {/* ─ Flight arc SVG ─ */}
            <div className="slide-up delay-2 w-full max-w-xs my-5">
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="f-mono text-[0.52rem] tracking-[.2em] uppercase text-white/30">From</p>
                  <p className="f-mono text-2xl font-medium text-white tracking-tight">HME</p>
                </div>
                <svg width="100%" height="50" viewBox="0 0 240 70"
                  className="flex-1 mx-3" preserveAspectRatio="none">
                  {/* Track */}
                  <path d="M 20 60 Q 120 10 220 60" fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4"/>
                  {/* Animated colored arc */}
                  <path d="M 20 60 Q 120 10 220 60" fill="none"
                    stroke="#E8694A" strokeWidth="1.5" className="arc-draw" strokeLinecap="round"/>
                  {/* Animated plane along path */}
                  <g className="plane-path">
                    <text fontSize="14" textAnchor="middle" dominantBaseline="middle" y="-2">✈</text>
                  </g>
                </svg>
                <div className="text-right">
                  <p className="f-mono text-[0.52rem] tracking-[.2em] uppercase text-white/30">To</p>
                  <p className={`f-mono text-2xl font-medium text-orange-400 tracking-tight ${destIn ? "dest-in" : "dest-out"}`}>
                    {dest.code}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="f-dm text-[0.62rem] text-white/30">Home Base</p>
                <p className={`f-dm text-[0.62rem] text-white/40 ${destIn ? "dest-in" : "dest-out"}`}>{dest.city}</p>
              </div>
            </div>

            {/* ─ Step indicator ─ */}
            <div className="slide-up delay-3 w-full max-w-xs">
              {/* Step label */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: "rgba(232,105,74,.15)", border: "1px solid rgba(232,105,74,.25)" }}>
                  {steps[stepIdx].icon}
                </div>
                <p className={`f-dm text-sm font-medium text-white/80 ${stepIn ? "step-in" : "step-out"}`}>
                  {steps[stepIdx].label}
                </p>
                <p className="f-mono text-[0.6rem] text-white/30 ml-auto flex-shrink-0">
                  {stepIdx + 1}/{steps.length}
                </p>
              </div>

              {/* Progress track */}
              <div className="h-1 rounded-full overflow-hidden mb-2"
                style={{ background: "rgba(255,255,255,.08)" }}>
                <div className="prog-fill h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>

              {/* Step dots */}
              <div className="flex gap-1.5 mb-5">
                {steps.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-500"
                    style={{
                      background: i <= stepIdx
                        ? "linear-gradient(90deg,#E8694A,#F5836B)"
                        : "rgba(255,255,255,.10)",
                    }} />
                ))}
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2">
                <span className="dot-1 w-1.5 h-1.5 rounded-sm bg-orange-500 inline-block" />
                <span className="dot-2 w-1.5 h-1.5 rounded-sm bg-orange-400 inline-block" />
                <span className="dot-3 w-1.5 h-1.5 rounded-sm bg-orange-300 inline-block" />
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Destination showcase (hidden on small screens) ── */}
          <div className="hidden lg:flex flex-col justify-center w-[380px] flex-shrink-0 relative
            border-l py-10 px-8"
            style={{ borderColor: "rgba(255,255,255,.06)" }}>

            {/* Top label */}
            <div className="slide-up delay-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                border f-mono text-[0.55rem] tracking-[.18em] uppercase text-white/40"
                style={{ borderColor: "rgba(255,255,255,.10)", background: "rgba(255,255,255,.04)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Trending Destinations
              </div>
            </div>

            {/* Destination card — big */}
            <div className={`slide-up delay-3 relative rounded-3xl overflow-hidden mb-4
              border ${destIn ? "dest-in" : "dest-out"}`}
              style={{
                background: `linear-gradient(135deg, ${dest.color}22 0%, rgba(15,13,10,0.95) 60%)`,
                borderColor: `${dest.color}30`,
                minHeight: "200px",
              }}>
              {/* Pattern */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }} />

              <div className="relative p-6">
                <div className="pin-bounce text-5xl mb-3">{dest.emoji}</div>
                <p className="f-mono text-[0.56rem] tracking-[.22em] uppercase mb-1"
                  style={{ color: `${dest.color}aa` }}>
                  {dest.country}
                </p>
                <p className="f-serif text-4xl font-bold text-white tracking-tight leading-none mb-1">
                  {dest.city}
                </p>
                <p className="f-mono text-lg font-medium tracking-widest"
                  style={{ color: dest.color }}>
                  {dest.code}
                </p>
              </div>

              {/* Bottom status strip */}
              <div className="absolute bottom-0 inset-x-0 px-5 py-3 flex items-center justify-between"
                style={{ background: "rgba(0,0,0,.4)", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <span className="f-dm text-[0.65rem] text-white/40">Popular choice</span>
                <span className="f-mono text-[0.58rem] tracking-wide text-emerald-400">● Available</span>
              </div>
            </div>

            {/* Mini dest cards */}
            <div className="slide-up delay-4 flex flex-col gap-2">
              {destinations.filter((_, i) => i !== destIdx).slice(0, 3).map((d, i) => (
                <div key={d.code}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.07)",
                    animationDelay: `${i * 0.08}s`,
                  }}>
                  <span className="text-xl">{d.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="f-dm text-sm font-semibold text-white/80 leading-none">{d.city}</p>
                    <p className="f-mono text-[0.56rem] text-white/30 tracking-wide mt-0.5">{d.code} · {d.country}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* ── Floating tags ── */}
            <div className="absolute top-6 right-6 tag-float">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full f-mono
                text-[0.55rem] tracking-[.12em] uppercase text-orange-400"
                style={{ background: "rgba(232,105,74,.12)", border: "1px solid rgba(232,105,74,.20)" }}>
                ✦ AI-Powered
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR — like an airport departure board ── */}
        <div className="absolute bottom-0 inset-x-0 border-t f-mono"
          style={{
            borderColor: "rgba(255,255,255,.07)",
            background: "rgba(0,0,0,.5)",
            backdropFilter: "blur(12px)",
          }}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[0.56rem] tracking-[.18em] uppercase text-white/30">Flight AI-2025</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[0.56rem] tracking-[.18em] uppercase text-white/20">Gate</span>
                <span className="text-[0.6rem] text-orange-400/70">AI-07</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[0.56rem] tracking-[.18em] uppercase text-white/20">Class</span>
                <span className="text-[0.6rem] text-white/40">Business</span>
              </div>
            </div>

            {/* Scrolling route ticker */}
            <div className="overflow-hidden flex-1 hidden md:block">
              <div className="card-scroll-track flex gap-8 whitespace-nowrap">
                {[...destinations, ...destinations].map((d, i) => (
                  <span key={i} className="text-[0.56rem] tracking-[.14em] text-white/20 uppercase">
                    {d.code} · {d.city}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[0.56rem] tracking-[.14em] text-white/25 uppercase">
              <span className="text-orange-400/60">Trip Up</span>
              <span>·</span>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;