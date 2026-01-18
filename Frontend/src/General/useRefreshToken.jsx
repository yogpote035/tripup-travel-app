import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../AllStatesFeatures/Authentication/authSlice";
import { toast } from "react-toastify";

export const useRefreshToken = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Do nothing if not logged in
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) return;

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          { id: userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const newToken = res?.data?.refreshToken;
        if (!newToken) throw new Error("No token received");

        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", res?.data?.userId);
        localStorage.setItem("username", res?.data?.username);

        // console.log("Token refreshed");
      } catch (err) {
        // console.error("Refresh token failed", err);
        toast.error("Session expired. Please log in again.");
        localStorage.clear();
        dispatch(logout());
        navigate("/login");
      }
    };

    // refresh every 10 seconds
    const interval = setInterval(refreshToken, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch, navigate]);
};
