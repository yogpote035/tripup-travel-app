import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoutes({ children }) {
  const { isAuthenticated, authInitialized } = useSelector((state) => state.auth);
  if (!authInitialized) {
    return null; // or a loading placeholder
  }
  if (!isAuthenticated) {
    toast.info("Please try to login or signup first");
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoutes;
