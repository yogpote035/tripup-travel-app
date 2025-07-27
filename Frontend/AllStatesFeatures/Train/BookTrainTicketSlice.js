import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  booking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "bookTrainTicket",
  initialState,
  reducers: {
    bookingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    bookingSuccess: (state, action) => {
      state.loading = false;
      state.booking = action.payload;
      state.error = null;
    },
    bookingFailure: (state, action) => {
      state.loading = false;
      state.booking = null;
      state.error = action.payload;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    clearBookingData: (state) => {
      state.booking = null;
    },
  },
});

export const {
  bookingRequest,
  bookingSuccess,
  bookingFailure,
  clearBookingError,
  clearBookingData,
} = bookingSlice.actions;

export default bookingSlice.reducer;

export const bookTrainSeats = (bookingData) => async (dispatch) => {
  dispatch(bookingRequest());
  console.log("From Booking Slice Booking Data");
  console.log(bookingData);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/train/train-book-seat`,
      bookingData,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );

    dispatch(bookingSuccess(response.data.booking));
    toast.success(response.data.message || "Booking successful!");
  } catch (error) {
    const msg = error.response?.data?.message || "Booking failed";
    dispatch(bookingFailure(msg));
    toast.error(msg);
  }
};
