import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminProtectedRoute({ children }) {
  const { authInitialized, isAuthenticated, user } = useSelector((state) => state.auth);
  if (!authInitialized) return <div className="admin-loading">Loading secure workspace…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}
