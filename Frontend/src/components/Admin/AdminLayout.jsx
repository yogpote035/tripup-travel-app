import { createElement, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, Users, CalendarCheck, MessageSquare, ShieldCheck, Plane, Train, Bus, Hotel, Menu, X, LogOut, ChevronRight, Megaphone, MapPin, Moon, Sun } from "lucide-react";
import { logout } from "../../../AllStatesFeatures/Authentication/authSlice";
import { toggleTheme } from "../../../AllStatesFeatures/Theme/ThemeSlice";
import { AdminErrorAlert } from "./AdminShared";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users }, { to: "/admin/flights", label: "Flights", icon: Plane },
  { to: "/admin/trains", label: "Trains", icon: Train }, { to: "/admin/buses", label: "Buses", icon: Bus },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck }, { to: "/admin/hotels", label: "Hotels", icon: Hotel },
  { to: "/admin/posts", label: "Posts", icon: MessageSquare }, { to: "/admin/locations", label: "Locations", icon: MapPin },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone }, { to: "/admin/audit-logs", label: "Audit logs", icon: ShieldCheck },
  { to: "/admin/backups", label: "Backups", icon: LayoutDashboard }, { to: "/admin/administrators", label: "Administrators", icon: ShieldCheck },
  { to: "/admin/system-status", label: "System status", icon: LayoutDashboard },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading admin data...");
  const [dismissedErrors, setDismissedErrors] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme?.mode || "light");
  const adminState = useSelector((state) => state.admin);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const crumb = location.pathname.split("/").filter(Boolean).at(-1) || "admin";
  const displayName = user?.name || user?.username || "Administrator";
  const visibleError = useMemo(() => Object.values(adminState || {})
    .map((value) => value?.error)
    .find((error) => error && !dismissedErrors.includes(error)), [adminState, dismissedErrors]);

  useEffect(() => {
    const handleLoadingState = (event) => {
      setIsApiLoading(Boolean(event?.detail?.loading));
      setLoadingMessage(event?.detail?.message || "Loading admin data...");
    };
    window.addEventListener("admin-api-loading", handleLoadingState);
    return () => window.removeEventListener("admin-api-loading", handleLoadingState);
  }, []);

  useEffect(() => setDismissedErrors([]), [location.pathname]);

  const signOut = () => { dispatch(logout()); navigate("/admin/login"); };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-sidebar-top"><Link to="/admin" className="admin-logo">TripUp <small>OPERATIONS</small></Link></div>
        <div className="admin-sidebar-menu"><nav>{links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>{createElement(link.icon, { size: 18 })}{link.label}</NavLink>
        ))}</nav></div>
        <div className="admin-sidebar-footer"><div className="admin-sidebar-user"><strong>{displayName}</strong><span>{user?.role?.toUpperCase() || "ADMIN"}</span></div><button className="admin-signout" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
      </aside>
      {open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <section className="admin-content">
        {isApiLoading && <div className="admin-global-loader" role="status" aria-live="polite"><div className="admin-global-loader__spinner" /><span>{loadingMessage}</span></div>}
        <header className="admin-header">
          <button className="admin-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
          <div className="admin-breadcrumb"><Link to="/admin">Admin</Link><ChevronRight size={15} /><span>{crumb === "admin" ? "Dashboard" : crumb.replaceAll("-", " ")}</span></div>
          <div className="admin-profile">
            <button type="button" className="admin-theme-toggle" onClick={() => dispatch(toggleTheme())} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button type="button" className="admin-profile-button"><b>{displayName.slice(0, 1).toUpperCase()}</b><span>{displayName}</span></button>
          </div>
        </header>
        <main className="admin-main"><AdminErrorAlert error={visibleError} onDismiss={() => setDismissedErrors((current) => [...current, visibleError])} /><Outlet /></main>
      </section>
    </div>
  );
}
