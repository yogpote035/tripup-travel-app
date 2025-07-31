import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  buses: [],
  from: "",
  to: "",
  total: 0,
  loading: false,
  error: null,
};

const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    fetchBusesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBusesSuccess: (state, action) => {
      state.loading = false;
      state.buses = action.payload.buses || [];
      state.from = action.payload.from || "";
      state.to = action.payload.to || "";
      state.total = action.payload.total || action.payload.buses?.length || 0;
    },
    fetchBusesFailure: (state, action) => {
      state.loading = false;
      state.buses = [];
      state.from = "";
      state.to = "";
      state.total = 0;
      state.error = action.payload;
    },
    clearBusErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchBusesRequest,
  fetchBusesSuccess,
  fetchBusesFailure,
  clearBusErrors,
} = busSlice.actions;

export default busSlice.reducer;

export const fetchBusesBetweenStations =
  ({ from, to, date }) =>
  async (dispatch) => {
    dispatch(fetchBusesRequest());
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/bus/bus-between`,
        {
          params: {
            source: from,
            destination: to,
            date,
          },
        }
      );

      if (res.status === 406) {
        const msg = res.data?.message || "Missing required parameters";
        dispatch(fetchBusesFailure(msg));
        toast.error(msg);
        return;
      }
      if (res.status === 208) {
        const msg = res.data?.message || "No Bus Found";
        dispatch(fetchBusesFailure(msg));
        toast.error(msg);
        return;
      }

      dispatch(
        fetchBusesSuccess({
          buses: res.data,
          from,
          to,
          total: res.data.length,
        })
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to fetch buses";
      dispatch(fetchBusesFailure(errMsg));
      toast.error(errMsg);
    }
  };
