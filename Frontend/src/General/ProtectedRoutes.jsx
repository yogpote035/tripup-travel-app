import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoutes({ children }) {
  const { isAuthenticated, authInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      toast.info("Please try to login or signup first");
    }
  }, [authInitialized, isAuthenticated]);

  if (!authInitialized) {
    return null;
  }

  return isAuthenticated ? children : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default ProtectedRoutes;
