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
      // state.booking = action.payload;
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
    getBookingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllBookingSuccess: (state, action) => {
      state.loading = false;
      state.booking = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    getBookingFailure: (state, action) => {
      state.loading = false;
      state.booking = null;
      state.error = action.payload;
    },
    clearGetBookingError: (state) => {
      state.error = null;
    },
    clearGetBookingData: (state) => {
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
  getBookingRequest,
  getAllBookingSuccess,
  getBookingFailure,
  clearGetBookingData,
  clearGetBookingError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
//for booking train seat
export const bookTrainSeats = (bookingData, navigate) => async (dispatch) => {
  dispatch(bookingRequest());
  try {
    console.log("calling backend");
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
    navigate("/train-bookings");
    toast.success(response.data.message || "Booking successful!");
  } catch (error) {
    const msg = error.response?.data?.message || "Booking failed";
    dispatch(bookingFailure(msg));
    toast.error(msg);
  }
};

// for get all booking's of current user
export const getUserTrainBookings = () => async (dispatch) => {
  dispatch(getBookingRequest());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/train/train-bookings`,
      {
        headers: {
          token: localStorage.getItem("token"),
          userId: localStorage.getItem("userId"),
        },
      }
    );


    // if (response.status === 208) {
    //   return;
    //   // dispatch(getBookingFailure(response?.data?.message));
    // }

    dispatch(getAllBookingSuccess(response.data));
    // toast.success(response.data.message || "yee!,we got Your Travel Memories!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to load bookings";
    dispatch(getBookingFailure(errMsg));
    toast.error(errMsg);
  }
};
