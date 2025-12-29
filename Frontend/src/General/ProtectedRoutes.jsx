import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoutes({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    toast.info("Please try to login or signup first");
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoutes;
