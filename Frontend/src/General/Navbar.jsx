import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../AllStatesFeatures/Authentication/authSlice";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaTicketAlt,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaPlane,
  FaBus,
  FaTrain,
  FaHome,
  FaMapMarkerAlt,
  FaBookmark,
  FaHeart,
} from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toggleTheme } from "../../AllStatesFeatures/Theme/ThemeSlice";
import NotificationsPanel from '../components/Notifications/NotificationsPanel';

/* ── Small reusable helpers ── */

const StubDivider = () => (
  <div className="hidden md:flex flex-col items-center flex-shrink-0">
    <div className="w-3 h-3 rounded-full border-2 border-orange-200 bg-orange-50" />
    <div
      className="w-px"
      style={{
        height: 28,
        background:
          "repeating-linear-gradient(180deg,#d6c4a0 0,#d6c4a0 5px,transparent 5px,transparent 9px)",
      }}
    />
    <div className="w-3 h-3 rounded-full border-2 border-orange-200 bg-orange-50" />
  </div>
);

const SidebarLink = ({ to, icon, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-700 hover:text-orange-600 transition-all text-sm font-semibold mb-1"
  >
    <span className="w-7 h-7 flex items-center justify-center bg-orange-100 rounded-md text-orange-500 text-xs flex-shrink-0">
      {icon}
    </span>
    {children}
  </Link>
);

/* ── Main Navbar ── */

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((s) => s.theme?.mode || "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    }
    dispatch(logout());
  };
  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) { }
  }, [theme]);
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const perforation =
    "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";

  return (
    <>
      {/* ────── TOP NAVBAR ────── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-orange-50 border-b-2 border-orange-200 shadow-sm">
        {/* Perforation strip */}
        <div className="h-1 w-full" style={{ background: perforation }} />

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/new2.png" alt="TripUp" className="h-11 w-auto" />
          </Link>

          <StubDivider />

          {/* Flight route badge */}
          <div className="hidden md:flex items-center gap-2 bg-stone-900 rounded-full px-4 py-1.5 flex-shrink-0 cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            <span className="font-black text-white text-lg tracking-widest uppercase">
              HOME
            </span>
            <div className="flex flex-col items-center">
              <FaPlane className="text-orange-400 text-sm" />
              <span className="text-stone-500 text-xs leading-none mt-0.5">
                nonstop
              </span>
            </div>
            <span className="font-black text-orange-400 text-lg tracking-widest uppercase">
              WORLD
            </span>
          </div>

          <StubDivider />
          {/* Theme toggle */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
              className="flex items-center gap-2 px-3 py-1 rounded-md border border-transparent hover:border-orange-200 hover:bg-orange-100 text-sm text-stone-700"
            >
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          <div className="hidden md:flex items-center ml-3">
            <NotificationsPanel />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/bookings", gate: "A1", label: "Bookings" },
              { to: "/itinerary", gate: "B2", label: "Itinerary" },
              { to: "/post", gate: "C3", label: "Post" },
            ].map(({ to, gate, label }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-start px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-200 hover:bg-orange-100 hover:text-orange-600 text-stone-700 transition-all duration-150 group"
              >
                <span className="text-xs font-semibold tracking-widest text-stone-400 group-hover:text-orange-400 uppercase leading-none mb-0.5">
                  GATE {gate}
                </span>
                <span className="text-sm font-bold uppercase tracking-wide leading-none">
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          <StubDivider />

          {/* Board button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-4 py-2 rounded-lg font-black tracking-widest text-sm uppercase transition-all duration-150 flex-shrink-0"
          >
            <FaBars className="text-xs" />
            <span>BOARD</span>
          </button>
        </div>
      </header>

      {/* ────── OVERLAY ────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ────── SIDEBAR / BOARDING PASS ────── */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-64 bg-orange-50 border-l-2 border-orange-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Perforation strip */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background:
              "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 10px,transparent 10px,transparent 18px)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-dashed border-orange-200">
          <div>
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase leading-none mb-1">
              Boarding Pass
            </p>
            <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase leading-none">
              MENU
            </h2>
          </div>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center border border-orange-200 rounded-lg text-stone-400 hover:border-orange-400 hover:text-orange-500 transition-all text-sm"
          >
            <FaTimes />
          </button>
        </div>

        {/* Sidebar menu: mobile nav + auth section (scrollable, hidden scrollbar) */}
        <div className="user-sidebar-menu">
          <div className="md:hidden px-4 pt-4 pb-3 border-b-2 border-dashed border-orange-200">
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
              Navigate
            </p>
            {
              [
                { to: "/", icon: <FaHome className="text-orange-500" />, label: "Home" },
                { to: "/train", icon: <FaTrain className="text-orange-500" />, label: "Train" },
                { to: "/bus", icon: <FaBus className="text-orange-500" />, label: "Bus" },
                { to: "/flight", icon: <FaPlane className="text-orange-500" />, label: "Flight" },
                { to: "/locations", icon: <FaMapMarkerAlt className="text-orange-500" />, label: "Locations" },
                { to: "/saved-posts", icon: <FaBookmark className="text-orange-500" />, label: "Saved Posts", authOnly: true },
                { to: "/liked-posts", icon: <FaHeart className="text-red-400" />, label: "Liked Posts", authOnly: true },
              ].filter(item => !item.authOnly || user)
               .map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={toggleSidebar}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-700 hover:text-orange-600 transition-all text-sm font-semibold mb-1"
                >
                  <span className="w-7 h-7 flex items-center justify-center bg-orange-100 rounded-md text-base">
                    {icon}
                  </span>
                  {label}
                </Link>
              ))
            }
          </div>

          {/* Auth section */}
          <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
            Passenger
          </p>
          {user ? (
            <>
              <SidebarLink to="/locations" icon={<FaMapMarkerAlt />} onClick={toggleSidebar}>
                Explore Locations
              </SidebarLink>
              <SidebarLink to="/saved-posts" icon={<FaBookmark />} onClick={toggleSidebar}>
                Saved Posts
              </SidebarLink>
              <SidebarLink to="/liked-posts" icon={<FaHeart />} onClick={toggleSidebar}>
                Liked Posts
              </SidebarLink>
              <SidebarLink to="/profile" icon={<FaUser />} onClick={toggleSidebar}>
                View Profile
              </SidebarLink>
              <SidebarLink
                to="/recent-activity"
                icon={<FaTicketAlt />}
                onClick={toggleSidebar}
              >
                Recent Activity
              </SidebarLink>
              <button
                onClick={() => {
                  handleLogout();
                  toggleSidebar();
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-stone-700 hover:text-red-500 transition-all text-sm font-semibold mb-1"
              >
                <span className="w-7 h-7 flex items-center justify-center bg-orange-100 rounded-md text-orange-500 text-xs flex-shrink-0">
                  <FaSignOutAlt />
                </span>
                Logout
              </button>
            </>
          ) : (
            <>
              <SidebarLink to="/login" icon={<FaSignInAlt />} onClick={toggleSidebar}>
                Login
              </SidebarLink>
              <SidebarLink to="/signup" icon={<FaUserPlus />} onClick={toggleSidebar}>
                Sign Up
              </SidebarLink>
            </>
          )}

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="mt-4 w-full px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-stone-700 hover:bg-orange-100 transition-all text-sm font-semibold"
          >
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </button>
        </div>
        </div>

        {/* end .user-sidebar-menu wrapper */}

        {/* Barcode footer */}
        <div className="mt-auto bg-stone-900 px-5 py-4">
          <div className="flex items-end gap-px mb-3 h-8">
            {[3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2].map(
              (w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-sm"
                  style={{
                    width: `${w * 3}px`,
                    height: `${60 + (i % 3) * 15}%`,
                    opacity: 0.15 + (i % 4) * 0.2,
                  }}
                />
              )
            )}
          </div>
          <p className="text-center text-xs tracking-widest text-stone-500 uppercase font-semibold">
            TRIPUP · Yogesh Pote
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;