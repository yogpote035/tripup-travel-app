import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  flights: [],
  from: "",
  to: "",
  date: "",
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
      state.date = action.payload.date || "";
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
    getDownloadRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    getDownloadSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    getDownloadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getMailRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    getMailSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    getMailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchFlightsRequest,
  fetchFlightsSuccess,
  fetchFlightsFailure,
  clearFlightErrors,
  getDownloadRequest,
  getDownloadSuccess,
  getDownloadFailure,
  getMailRequest,
  getMailSuccess,
  getMailFailure,
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
          flights: res.data.flights,
          from: res.data.from,
          to: res.data.to,
          date: res.data.date,
          total: res.data.length,
        })
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to fetch flights";
      dispatch(fetchFlightsFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const downloadFlightTicket =
  (bookingId) => async (dispatch, getState) => {
    dispatch(getDownloadRequest());

    const token = getState().auth.token || localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/flight/download-flight-ticket`,
        {
          params: { bookingId },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        const msg = response.data?.message || "Missing Required Parameters";
        dispatch(getDownloadFailure(msg));
        toast.error(msg);
        return;
      }
      if (response.status === 208) {
        const msg = response.data?.message || "Booking Not Found";
        dispatch(getDownloadFailure(msg));
        toast.error(msg);
        return;
      }

      const disposition = response.headers["content-disposition"];
      let filename = "flight-ticket.pdf";

      if (disposition && disposition.includes("filename")) {
        const match = disposition.match(
          /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/
        );
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      dispatch(getDownloadSuccess());
      toast.success("Flight ticket downloaded!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to download flight ticket";
      dispatch(getDownloadFailure(message));
      toast.error(message);
    }
  };

export const mailFlightTicket =
  (bookingId) => async (dispatch, getState) => {
    dispatch(getMailRequest());

    const token = getState().auth.token || localStorage.getItem("token");
    if (!bookingId) {
      return toast.error("Booking Id is Missing");
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/flight/mail-flight-ticket`,
        {
          params: { bookingId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        const msg = response.data?.message || "Missing Required Parameters";
        dispatch(getMailFailure(msg));
        toast.error(msg);
        return;
      }
      if (response.status === 208) {
        const msg = response.data?.message || "Booking Not Found";
        dispatch(getMailFailure(msg));
        toast.error(msg);
        return;
      }

      dispatch(getMailSuccess());
      toast.success("Flight ticket emailed successfully!");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to send flight ticket email";
      dispatch(getMailFailure(errMsg));
      toast.error(errMsg);
    }
  };
