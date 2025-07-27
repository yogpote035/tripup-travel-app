import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { Link } from "react-router-dom"; // ✅ added Link

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-gray-800 fixed top-0 left-0 w-full z-100">
      {/* Top Navbar */}
      <nav className="bg-gray-800 shadow-md px-4 py- flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center">
            <img src="/new2.png" alt="TripUp Logo" className="h-18 w-20" />
            {/* <span>TripUp</span> */}
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div
            className={`hidden md:flex gap-x-6 transition-all duration-300 ${
              sidebarOpen ? "md:translate-x-[-176px]" : "md:translate-x-0"
            }`}
          >
            <Link
              to="/bookings"
              className="text-white hover:text-white font-medium"
            >
              Bookings
            </Link>
            <Link
              to="/itinerary"
              className="text-white hover:text-white font-medium"
            >
              Itinerary
            </Link>
            <Link
              to="/diary"
              className="text-white hover:text-white font-medium"
            >
              Diary
            </Link>
          </div>

          {!sidebarOpen && (
            <button onClick={toggleSidebar} className="text-xl text-white">
              <FaBars />
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-44 bg-gray-800 shadow-lg z-50 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="px-6 pt-6 space-y-4">
          <div className="block md:hidden space-y-3">
            <Link to="/bookings" className="block text-white hover:text-white">
              📘 Bookings
            </Link>
            <Link to="/itinerary" className="block text-white hover:text-white">
              📍 Itinerary
            </Link>
            <Link to="/diary" className="block text-white hover:text-white">
              📸 Diary
            </Link>
            <hr />
          </div>

          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-white hover:text-white"
              >
                <FaUser /> View Profile
              </Link>
              <Link
                to="/ticket-history"
                className="flex items-center gap-2 text-white hover:text-white"
              >
                <FaTicketAlt /> Ticket History
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-left hover:text-red-600"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 text-white hover:text-white"
              >
                <FaSignInAlt /> Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 text-white hover:text-white"
              >
                <FaUserPlus /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
