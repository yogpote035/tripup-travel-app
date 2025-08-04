import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  flights: [],
  from: "",
  to: "",
  total: 0,
  loading: false,
  error: null,
};

const flightSlice = createSlice({
  name: "flight",
  initialState,
  reducers: {
    fetchFlightsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFlightsSuccess: (state, action) => {
      state.loading = false;
      state.flights = action.payload.flights || [];
      state.from = action.payload.from || "";
      state.to = action.payload.to || "";
      state.total = action.payload.total || action.payload.flights?.length || 0;
    },
    fetchFlightsFailure: (state, action) => {
      state.loading = false;
      state.flights = [];
      state.from = "";
      state.to = "";
      state.total = 0;
      state.error = action.payload;
    },
    clearFlightErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchFlightsRequest,
  fetchFlightsSuccess,
  fetchFlightsFailure,
  clearFlightErrors,
} = flightSlice.actions;

export default flightSlice.reducer;




export const fetchFlightsBetweenAirports =
  ({ from, to, date }) =>
  async (dispatch) => {
    dispatch(fetchFlightsRequest());
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/flight/flight-between`,
        {
          params: {
            from,
            to,
            date,
          },
        }
      );

      if (res.status === 406) {
        const msg = res.data?.message || "Missing required parameters";
        dispatch(fetchFlightsFailure(msg));
        toast.error(msg);
        return;
      }
      if (res.status === 204) {
        const msg = res.data?.message || "No Flight Found";
        dispatch(fetchFlightsFailure(msg));
        toast.error(msg);
        return;
      }

      dispatch(
        fetchFlightsSuccess({
          flights: res.data,
          from,
          to,
          total: res.data.length,
        })
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to fetch flights";
      dispatch(fetchFlightsFailure(errMsg));
      toast.error(errMsg);
    }
  };
