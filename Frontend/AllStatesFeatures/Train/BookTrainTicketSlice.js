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

    // for booking seat
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
    // download receipt

    getDownloadRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getDownloadSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    getDownloadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || "";
    },
  },
});

export const {
  // for book Train
  bookingRequest,
  bookingSuccess,
  bookingFailure,
  clearBookingError,
  clearBookingData,
  getBookingRequest,
  // All Booking
  getAllBookingSuccess,
  getBookingFailure,
  clearGetBookingData,
  clearGetBookingError,
  //for download Ticket
  getDownloadRequest,
  getDownloadSuccess,
  getDownloadFailure,
} = bookingSlice.actions;

export default bookingSlice.reducer;
//for booking train seat
export const bookTrainSeats =
  (bookingData, navigate) => async (dispatch, getState) => {
    dispatch(bookingRequest());
    const token = getState().auth.token;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/train/train-book-seat`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || token}`,
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
export const getUserTrainBookings = () => async (dispatch, getState) => {
  dispatch(getBookingRequest());
  const token = getState().auth.token;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/train/train-bookings`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || token}`,
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

// for download ticket in form of pdf
export const downloadTicket = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest());
  const token = getState().auth.token;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/train/train-bookings-receipt`,
      {
        params: {
          bookingId,
        },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || token}`,
        },
      }
    );

    // Get file name from header
    const contentDisposition = response.headers["content-disposition"];
    let filename = "ticket.pdf";

    if (contentDisposition?.includes("filename=")) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    // Optional success message
    dispatch(getDownloadSuccess());
    toast.success("Ticket downloaded!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to Get Your ticket";
    toast.error(errMsg);
    dispatch(getDownloadFailure(errMsg));
  }
};

// for Mail ticket in form of pdf
export const MailTicketPdf = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest()); //states not  need here ,i used for timepass message
  const token = getState().auth.token;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/train/train-bookings-receipt-mail`,
      {
        params: {
          bookingId,
        },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || token}`,
        },
      }
    );

    // Optional success message
    dispatch(getDownloadSuccess());
    toast.success("Ticket Mail Successfully!");
  } catch (error) {
    const errMsg =
      error.response?.data?.message || "Failed to Mail Your ticket";
    toast.error(errMsg);
    dispatch(getDownloadFailure(errMsg));
  }
};

// for Cancel Ticket
export const cancelTrainTicket = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest()); //states not  need here ,i used for timepass message
  const token = getState().auth.token;

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/train/cancel-train-ticket`,
      {
        bookingId: bookingId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || token}`,
        },
      }
    );

    // Optional success message
    dispatch(getDownloadSuccess());
    toast.success("Ticket Cancelled!");
  } catch (error) {
    const errMsg =
      error.response?.data?.message || "Failed to Cancel Your ticket";
    toast.error(errMsg);
    dispatch(getDownloadFailure(errMsg));
  }
};
