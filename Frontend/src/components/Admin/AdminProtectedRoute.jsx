import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminProtectedRoute({ children }) {
  const { authInitialized, isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!authInitialized) return <div className="admin-loading">Loading secure workspace…</div>;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}
