import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  error: null,
  activities: [],
};

const RecentActivitySlice = createSlice({
  name: "recentActivity",
  initialState,
  reducers: {
    recentActivityRequest: (state) => {
      state.loading = true;
    },
    recentActivitySuccess: (state, action) => {
      state.loading = false;
      state.activities = action.payload;
    },
    recentActivityFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  recentActivityRequest,
  recentActivitySuccess,
  recentActivityFailure,
} = RecentActivitySlice.actions;

export default RecentActivitySlice.reducer;

export const GetRecentActivity = () => async (dispatch, getState) => {
  dispatch(recentActivityRequest());
  const userId = getState()?.user?.userId || localStorage?.getItem("userId");
  const token = getState()?.user?.token || localStorage?.getItem("token");
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/user/recent-activity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId,
        },
      }
    );

    dispatch(recentActivitySuccess(data.recentActivity || []));
  } catch (error) {
    const msg =
      error.response?.data?.message || "Failed to load recent activity";
    dispatch(recentActivityFailure(msg));
  }
};
