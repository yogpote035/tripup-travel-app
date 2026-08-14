import axios from "axios";
import Store from "../../MainStoreOfRedux/CentralStore.js";
import { setAccessToken, logout } from "../../AllStatesFeatures/Authentication/authSlice.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn("VITE_API_BASE_URL was not set; falling back to http://localhost:5000/api");
}

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds for most requests


let refreshPromise = null;
let pendingRequests = 0;

const getLoadingMessage = (config = {}) => {
  const method = String(config.method || "get").toUpperCase();
  const url = String(config.url || "");
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("/auth/login") || lowerUrl.includes("/auth/admin/login")) {
    return "Signing in…";
  }
  if (lowerUrl.includes("/auth/refresh")) {
    return "Refreshing session…";
  }
  if (lowerUrl.includes("/notifications/announce") || lowerUrl.includes("/notifications/admin/announcements")) {
    return method === "GET" ? "Loading announcements…" : "Sending announcement…";
  }
  if (lowerUrl.includes("/users")) {
    return method === "GET" ? "Loading users…" : "Saving user…";
  }
  if (lowerUrl.includes("/bookings")) {
    return method === "GET" ? "Loading bookings…" : "Saving booking…";
  }
  if (lowerUrl.includes("/flights")) {
    return method === "GET" ? "Loading flights…" : "Saving flight…";
  }
  if (lowerUrl.includes("/trains")) {
    return method === "GET" ? "Loading trains…" : "Saving train…";
  }
  if (lowerUrl.includes("/buses")) {
    return method === "GET" ? "Loading buses…" : "Saving bus…";
  }
  if (lowerUrl.includes("/posts")) {
    return method === "GET" ? "Loading posts…" : "Saving post…";
  }
  if (lowerUrl.includes("/locations")) {
    return method === "GET" ? "Loading locations…" : "Saving location…";
  }
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    return "Saving changes…";
  }
  return "Loading admin data…";
};

const emitAdminLoadingState = (loading, message) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin-api-loading", { detail: { loading, message } }));
  }
};

const updatePendingRequestState = (config = {}) => {
  emitAdminLoadingState(pendingRequests > 0, pendingRequests > 0 ? getLoadingMessage(config) : "");
};

async function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = axios.post("/auth/refresh", {}).then((res) => {
      return res.data?.data?.accessToken;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

axios.interceptors.request.use((config) => {
  if (config?.headers?.["X-Suppress-Admin-Loader"] === "true") {
    return config;
  }

  // Set longer timeout for slow endpoints
  const lowerUrl = String(config.url || "").toLowerCase();
  if (lowerUrl.includes("/auth/signup") || lowerUrl.includes("/auth/register") || lowerUrl.includes("itinerary/generate")) {
    config.timeout = 45000; // 45 seconds for signup and itinerary generation
  } else if (lowerUrl.includes("/admin/") && config.method === "post") {
    config.timeout = 40000; // 40 seconds for admin operations
  } else if (!config.timeout) {
    config.timeout = 30000; // Default 30 seconds
  }

  pendingRequests += 1;
  updatePendingRequestState(config);
  try {
    const state = Store.getState();
    const token = state.auth?.accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

axios.interceptors.response.use(
  (res) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    updatePendingRequestState(res?.config || {});
    return res;
  },
  async (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    updatePendingRequestState(error?.config || {});
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Only attempt refresh for expired access tokens
    if (status === 401 && code === "ACCESS_TOKEN_EXPIRED" && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await requestRefresh();
        if (newAccessToken) {
          Store.dispatch(setAccessToken(newAccessToken));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (e) {
        Store.dispatch(logout());
        return Promise.reject(e);
      }
    }

    // For other auth failures, clear auth
    if (status === 401) {
      const isRefreshSessionError = code && ["REFRESH_TOKEN_MISSING", "REFRESH_TOKEN_INVALID", "REFRESH_TOKEN_REUSE_DETECTED"].includes(code);
      if (isRefreshSessionError) {
        Store.dispatch(setAccessToken(null));
      } else {
        Store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
