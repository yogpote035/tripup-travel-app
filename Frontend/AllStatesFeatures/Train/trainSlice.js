import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  trains: [],
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
      state.trains = action.payload;
    },
    fetchTrainsFailure: (state, action) => {
      state.loading = false;
      state.trains = [];
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

//fetch trains between 2 stations
export const fetchTrainsBetweenStations =
  ({ from, to }) =>
  async (dispatch) => {
    console.log("from train slice b/w two station");
    console.log(from + " : " + to);
    dispatch(fetchTrainsRequest());
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/train/train-between`,
        { params: { from, to } }
      );
      if (res.status === 406) {
        dispatch(
          fetchTrainsFailure(
            res?.data?.message || "Source and Destination Station is Required"
          )
        );
        return toast.error(
          res?.data?.message || "Source and Destination Station is Required"
        );
      }
      if (res.status === 208) {
        dispatch(
          fetchTrainsFailure(
            res?.data?.message || "No Train Matches Your Route"
          )
        );
        return toast.error(res?.data?.message || "No Train Found Between");
      }
      console.log(res.data);
      dispatch(fetchTrainsSuccess(res.data));
    } catch (error) {
      dispatch(
        fetchTrainsFailure(
          error.response?.data?.message || "Failed to load trains"
        )
      );
      toast.error("Failed to fetch trains between selected stations");
    }
  };
