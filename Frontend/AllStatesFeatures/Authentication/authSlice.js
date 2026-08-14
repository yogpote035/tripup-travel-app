import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

function accessTokenPayload(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part));
  } catch {
    return null;
  }
}

const storedToken = localStorage.getItem("token");
const storedUserId = localStorage.getItem("userId");
const storedUsername = localStorage.getItem("username");

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const initialState = {
  user: storedUserId && storedUsername ? {
    userId: storedUserId,
    username: storedUsername,
    name: localStorage.getItem("name") || storedUsername || "",
    profileImage: localStorage.getItem("profileImage") || "",
    role: localStorage.getItem("userRole") || "user",
  } : null,
  isAuthenticated: Boolean(storedToken),
  authInitialized: false,
  loading: false,
  error: null,
  accessToken: storedToken || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.user = {
        userId: action.payload.user._id,
        username: action.payload.user.name,
        name: action.payload.user.name,
        profileImage: action.payload.user.profileImage || "",
        role: action.payload.user.role || "user",
      };
      localStorage.setItem("userId", action.payload.user._id);
      localStorage.setItem("username", action.payload.user.name);
      localStorage.setItem("name", action.payload.user.name);
      localStorage.setItem("profileImage", action.payload.user.profileImage || "");
      localStorage.setItem("userRole", action.payload.user.role || "user");
      localStorage.setItem("token", action.payload.accessToken);
      state.accessToken = action.payload.accessToken;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.error = action.payload;
    },

    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.user = {
        userId: action.payload.user._id,
        username: action.payload.user.name,
        name: action.payload.user.name,
        profileImage: action.payload.user.profileImage || "",
        role: action.payload.user.role || "user",
      };
      localStorage.setItem("userId", action.payload.user._id);
      localStorage.setItem("username", action.payload.user.name);
      localStorage.setItem("name", action.payload.user.name);
      localStorage.setItem("profileImage", action.payload.user.profileImage || "");
      localStorage.setItem("userRole", action.payload.user.role || "user");
      localStorage.setItem("token", action.payload.accessToken);
      state.accessToken = action.payload.accessToken;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
      state.accessToken = null;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.accessToken = null;
      state.authInitialized = true;
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("name");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      toast.success("Logout successful");
    },
    setAuthInitialized: (state, action) => {
      state.authInitialized = action.payload === true;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
      const payload = action.payload ? accessTokenPayload(action.payload) : null;
      if (payload?.sub) {
        state.user = {
          userId: payload.sub,
          username: state.user?.username || localStorage.getItem("username") || "User",
          name: state.user?.name || localStorage.getItem("name") || localStorage.getItem("username") || "User",
          profileImage: state.user?.profileImage || localStorage.getItem("profileImage") || "",
          role: payload.role || "user",
        };
        localStorage.setItem("userId", payload.sub);
        localStorage.setItem("userRole", payload.role || "user");
      }
    },

    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearErrors,
  signupRequest,
  signupSuccess,
  signupFailure,
  setAuthInitialized,
  setAccessToken,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
} = authSlice.actions;

export default authSlice.reducer;

export const loginUser = (payload) => async (dispatch) => {
  dispatch(loginRequest());
  const { email, phone, password } = payload;
  try {
    const { data, status } = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email, //based on mobile or email
        phone,
        password,
      }
    );
    if (status === 200) {
      toast.success(data.message || "Login successful");
      return dispatch(loginSuccess(data.data));
    }
    // user found but password not match
    if (status === 208) {
      dispatch(
        loginFailure(
          data?.message || "Password Not Match, Please Check Your Credentials"
        )
      );
      return toast.error("Password Not Match, Please Check Your Credentials");
    }

    // user Not found
    if (status === 204) {
      toast.error("User Not Found, Please Check Your Credentials");
      return dispatch(
        loginFailure(data?.message || "Login failed. Try again.")
      );
    }

    // user is Admin
    if (status === 203) {
      dispatch(loginFailure(data?.message || "Login failed. Try again."));
      return toast.error(data?.message || "Login failed. Try again.");
    }
  } catch (error) {
    dispatch(
      loginFailure(error.response?.data?.message || "Login failed. Try again.")
    );
  }
};

export const signupUser = (payload) => async (dispatch) => {
  dispatch(signupRequest());
  const { name, email, phone, password } = payload;

  try {
    const { data, status } = await axios.post(
      `${API_BASE_URL}/auth/signup`,
      {
        name,
        email,
        phone,
        password,
      }
    );
    if (status === 208) {
      toast.error("This Phone Or Mail User Already Exists");
      return dispatch(signupFailure("User already exists"));
    }
    dispatch(signupSuccess(data.data));
    toast.success(data.message || "Signup successful");
  } catch (error) {
    dispatch(
      signupFailure(
        error.response?.data?.message || "Signup failed. Try again."
      )
    );
    toast.error(error.response?.data?.message);
  }
};

export const loginAdmin = ({ email, password }) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/admin/login`, { email, password });
    dispatch(loginSuccess(data.data));
    toast.success(data.message || "Administrator login successful");
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Administrator login failed";
    dispatch(loginFailure(message));
    toast.error(message);
    return { success: false };
  }
};
export const requestPasswordReset = ({ email }) => async (dispatch) => {
  dispatch(forgotPasswordRequest());
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    dispatch(forgotPasswordSuccess());
    toast.success(data.message || "If an account exists for that email, a reset link has been prepared.");
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Unable to process password reset request";
    dispatch(forgotPasswordFailure(message));
    toast.error(message);
    return { success: false };
  }
};

export const resetPassword = ({ token, password }) => async (dispatch) => {
  dispatch(resetPasswordRequest());
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
    dispatch(resetPasswordSuccess());
    toast.success(data.message || "Password reset successful");
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Unable to reset password";
    dispatch(resetPasswordFailure(message));
    toast.error(message);
    return { success: false };
  }
};
