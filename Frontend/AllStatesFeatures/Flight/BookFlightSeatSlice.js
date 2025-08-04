import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  success: false,
  error: null,
  booking: null, //not needed but for better code and fetching all flight bookings and store in this to avoid second slice
};

const flightBookingSlice = createSlice({
  name: "flightBooking",
  initialState,
  reducers: {
    bookFlightRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    bookFlightSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      //   state.booking = action.payload;
    },
    bookFlightFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetFlightBooking: (state) => {
      return initialState;
    },
    // for my flight bookings
    getMyFlightBookingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getMyFlightBookingsSuccess: (state, action) => {
      state.loading = false;
      state.booking = action.payload;
    },
    getMyFlightBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  bookFlightRequest,
  bookFlightSuccess,
  bookFlightFailure,
  resetFlightBooking,
  getMyFlightBookingsRequest,
  getMyFlightBookingsSuccess,
  getMyFlightBookingsFailure,
} = flightBookingSlice.actions;

export default flightBookingSlice.reducer;

export const bookFlightSeat =
  (bookingData, navigate) => async (dispatch, getState) => {
    dispatch(bookFlightRequest());

    try {
      const token = getState().auth.token || localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/flight/book-flight-seat`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 406) {
        const msg = res.data?.message || "Missing required booking fields...";
        dispatch(bookFlightFailure(msg));
        return toast.error(msg);
      }

      if (res.status === 204) {
        const msg =
          res.data?.message ||
          "Seat Not Available, Sorry Seat is Already Booked...";
        dispatch(bookFlightFailure(msg));
        navigate("/flight");
        return toast.error(msg);
      }
      if (res.status === 208) {
        const msg = res.data?.message || "Booking failed!!, Flight Not Found";
        dispatch(bookFlightFailure(msg));
        navigate("/flight");
        return toast.error(msg);
      }

      dispatch(bookFlightSuccess());
      navigate("/flight-bookings");
      toast.success("Flight booked successfully!");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Flight booking failed";
      dispatch(bookFlightFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const fetchMyFlightBookings = () => async (dispatch, getState) => {
  dispatch(getMyFlightBookingsRequest());
  try {
    const token = getState().auth.token || localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/flight/my-flights`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 208) {
      const msg = res.data?.message || "Booking failed!!, Flight Not Found";
      dispatch(getMyFlightBookingsFailure(msg));
      return toast.error(msg);
    }

    dispatch(getMyFlightBookingsSuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch bookings";
    dispatch(getMyFlightBookingsFailure(errMsg));
    toast.error(errMsg);
  }
};
