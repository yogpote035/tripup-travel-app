import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  error: null,
  profile: null,
  totalBookings: 0,
};

const UserProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    profileRequest: (state) => {
      state.loading = true;
    },
    profileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload.user;
      state.totalBookings = action.payload.totalBookings;
    },
    profileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { profileRequest, profileSuccess, profileFailure } =
  UserProfileSlice.actions;

export default UserProfileSlice.reducer;

export const GetUserProfile = () => async (dispatch, getState) => {
  dispatch(profileRequest());
  const { token, user } = getState().auth;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || token}`,
          userId: localStorage.getItem("userId") || user.userId,
        },
      }
    );
    dispatch(profileSuccess(data));
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to load profile";
    dispatch(profileFailure(msg));
  }
};
