import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  // const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

export default ProtectedRoutes;
