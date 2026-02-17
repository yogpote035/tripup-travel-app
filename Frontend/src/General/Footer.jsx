import { Link, useNavigate } from "react-router-dom";
import { FaPlane } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-orange-50 border-t-2 border-orange-200">
      {/* Perforation strip */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left — branding */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 bg-stone-900 rounded-full px-3 py-1 cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            <span className="font-black text-white text-sm tracking-widest uppercase">
              TRIP
            </span>
            <FaPlane className="text-orange-400 text-xs" />
            <span className="font-black text-orange-400 text-sm tracking-widest uppercase">
              UP
            </span>
          </div>
          <p className="text-xs text-stone-400 font-semibold tracking-wide uppercase">
            © {new Date().getFullYear()} · All rights reserved
          </p>
        </div>

        {/* Center stub divider */}
        <div
          className="hidden md:block h-px flex-1 mx-4"
          style={{
            background:
              "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 6px,transparent 6px,transparent 12px)",
          }}
        />

        {/* Right — links styled as gate tags */}
        <div className="flex items-center gap-2">
          {[
            { to: "/privacy-policy", gate: "D1", label: "Privacy" },
            { to: "/terms", gate: "D2", label: "Terms" },
            { to: "/contact", gate: "D3", label: "Contact" },
          ].map(({ to, gate, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-start px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-200 hover:bg-orange-100 hover:text-orange-600 text-stone-500 transition-all duration-150 group"
            >
              <span className="text-xs font-semibold tracking-widest text-stone-300 group-hover:text-orange-300 uppercase leading-none mb-0.5">
                {gate}
              </span>
              <span className="text-xs font-bold uppercase tracking-wide leading-none">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
