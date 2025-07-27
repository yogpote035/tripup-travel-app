import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  trains: [],
  from: "",
  to: "",
  total: 0,
  loading: false,
  error: null,
};

const trainSlice = createSlice({
  name: "train",
  initialState,
  reducers: {
    fetchTrainsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTrainsSuccess: (state, action) => {
      state.loading = false;
      state.trains = action.payload.trains || [];
      state.from = action.payload.from || "";
      state.to = action.payload.to || "";
      state.total = action.payload.total || action.payload.trains?.length || 0;
    },
    fetchTrainsFailure: (state, action) => {
      state.loading = false;
      state.trains = [];
      state.from = "";
      state.to = "";
      state.total = 0;
      state.error = action.payload;
    },
    clearTrainErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchTrainsRequest,
  fetchTrainsSuccess,
  fetchTrainsFailure,
  clearTrainErrors,
} = trainSlice.actions;

export default trainSlice.reducer;

export const fetchTrainsBetweenStations =
  ({ from, to, day, trainType }) =>
  async (dispatch) => {
    dispatch(fetchTrainsRequest());

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/train/train-between`,
        {
          params: {
            from,
            to,
            ...(day && { day }),
            ...(trainType && { trainType }),
          },
        }
      );

      if (res.status === 406 || res.status === 208) {
        const msg = res.data?.message || "No Train Found";
        dispatch(fetchTrainsFailure(msg));
        toast.error(msg);
        return;
      }
      dispatch(
        fetchTrainsSuccess({
          trains: res.data,
          from,
          to,
          total: res.data.length,
        })
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to fetch trains";
      dispatch(fetchTrainsFailure(errMsg));
      toast.error(errMsg);
    }
  };
