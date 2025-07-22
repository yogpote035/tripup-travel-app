import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
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
      state.user = action.payload;
      localStorage.setItem("userId", JSON.stringify(action.payload.userId));
      localStorage.setItem("username", JSON.stringify(action.payload.username));
      localStorage.setItem("token", JSON.stringify(action.payload.token));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },

    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem("userId", JSON.stringify(action.payload.userId));
      localStorage.setItem("username", JSON.stringify(action.payload.username));
      localStorage.setItem("token", JSON.stringify(action.payload.token));
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
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
} = authSlice.actions;

export default authSlice.reducer;

export const loginUser = (payload) => async (dispatch) => {
  dispatch(loginRequest());
  const { email, phone, password } = payload;
  try {
    const { data } = await axios.post("http://localhost:5000/api/auth/login", {
      email, //based on mobile or email
      phone,
      password,
    });
    dispatch(loginSuccess(data));
  } catch (error) {
    dispatch(
      loginFailure(error.response?.data?.message || "Login failed. Try again.")
    );
  }
};

export const signupUser =
  (name, email, phone, password) => async (dispatch) => {
    dispatch(signupRequest());
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name,
          email,
          phone,
          password,
        }
      );
      dispatch(signupSuccess(data));
    } catch (error) {
      dispatch(
        signupFailure(
          error.response?.data?.message || "Signup failed. Try again."
        )
      );
    }
  };
