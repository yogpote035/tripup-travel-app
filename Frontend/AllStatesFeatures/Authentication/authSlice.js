import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  user: {
    userId: null,
    username: null,
    token: null,
  },
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
      state.user = {
        userId: action.payload.userId,
        username: action.payload.username,
        token: action.payload.token,
      };
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
      state.user = {
        userId: action.payload.userId,
        username: action.payload.username,
        token: action.payload.token,
      };
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
    const { data, status } = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email, //based on mobile or email
        phone,
        password,
      }
    );
    if (status === 200) {
      toast.success(data.message || "Login successful");
      return dispatch(loginSuccess(data));
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
      return toast.error(
        "You are not authorized or General User to access this page"
      );
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
      "http://localhost:5000/api/auth/signup",
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
    dispatch(signupSuccess(data));
  } catch (error) {
    dispatch(
      signupFailure(
        error.response?.data?.message || "Signup failed. Try again."
      )
    );
    toast.error(error.response?.data?.message);
  }
};
