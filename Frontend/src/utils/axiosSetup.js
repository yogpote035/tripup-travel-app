import axios from "axios";
import Store from "../../MainStoreOfRedux/CentralStore.js";
import { setAccessToken, logout } from "../../AllStatesFeatures/Authentication/authSlice.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

let refreshPromise = null;

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
  (res) => res,
  async (error) => {
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
