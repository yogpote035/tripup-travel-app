import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  booking: null,
  loading: false,
  error: null,
};

const busBookingSlice = createSlice({
  name: "busBooking",
  initialState,
  reducers: {
    bookingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    bookingSuccess: (state, action) => {
      state.loading = false;
      //   state.booking = action.payload;
      state.error = null;
    },
    bookingFailure: (state, action) => {
      state.loading = false;
      state.booking = null;
      state.error = action.payload;
    },

    getAllBookingRequest: (state) => {
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

    getDownloadRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getDownloadSuccess: (state) => {
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
  bookingRequest,
  bookingSuccess,
  bookingFailure,
  getAllBookingRequest,
  getAllBookingSuccess,
  getBookingFailure,
  getDownloadRequest,
  getDownloadSuccess,
  getDownloadFailure,
} = busBookingSlice.actions;

export default busBookingSlice.reducer;

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = resolve;
  script.onerror = () => reject(new Error("Unable to load Razorpay SDK"));
  document.body.appendChild(script);
});

export const bookBusSeats =
  (bookingData, navigate) => async (dispatch, getState) => {
    dispatch(bookingRequest());
    const token = getState().auth.accessToken;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/bus/book-bus-seat`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token") || ""}`,
            userId: localStorage.getItem("userId"),
          },
        }
      );
      if (response.status === 201) {
        const booking = response.data?.data?.booking;
        const payment = response.data?.data?.payment;
        if (!booking || !payment?.order || !payment?.paymentKeyId) throw new Error("Payment order could not be created");
        await loadRazorpayScript();
        const razorpay = new window.Razorpay({
          key: payment.paymentKeyId,
          amount: payment.order.amount,
          currency: payment.order.currency,
          name: "TripUp Buses",
          description: `Bus booking for ${bookingData.source} to ${bookingData.destination}`,
          order_id: payment.order.id,
          handler: async (paymentResponse) => {
            try {
              await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bus/confirmBusBooking`, {
                bookingId: booking._id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }, { headers: { Authorization: `Bearer ${token || localStorage.getItem("token") || ""}` } });
              dispatch(bookingSuccess());
              toast.success("Bus booking successful!");
              navigate("/bus-bookings");
            } catch (error) {
              dispatch(bookingFailure("Payment received. Your booking is being confirmed."));
              toast.info("Payment received. Your booking is being confirmed. Please check your bookings shortly.");
            }
          },
          modal: { ondismiss: () => { dispatch(bookingFailure("Payment window closed before completion.")); toast.error("Payment window closed before completion."); } },
          theme: { color: "#f97316" },
        });
        razorpay.open();
        return;
      }
      if (response.status === 406) {
        const msg = response.data?.message || "Missing required booking fields";
        dispatch(bookingFailure(msg));
        return toast.error(msg);
      }

      if (response.status === 208) {
        const msg = response.data?.message || "Booking failed";
        dispatch(bookingFailure(msg));
        navigate("/bus");
        return toast.error(msg);
      }
      if (response.status === 204) {
        const msg = response.data?.message || "Booking failed!!, Bus Not Found";
        dispatch(bookingFailure(msg));
        navigate("/bus");
        return toast.error(msg);
      }
      if (response.status === 203) {
        const msg =
          response.data?.message || "This Seat Already Booked or Dose't Exist";
        dispatch(bookingFailure(msg));
        navigate("/bus");
        return toast.error(msg);
      }
      if (response.status === 200) {
        dispatch(bookingSuccess());
        toast.success(response.data.message || "Bus Booking successful!");
        navigate("/bus-bookings");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Booking failed";
      dispatch(bookingFailure(msg));
      toast.error(msg);
    }
  };

export const getUserBusBookings = () => async (dispatch, getState) => {
  dispatch(getAllBookingRequest());
  const token = getState().auth.accessToken;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/bus/bus-bookings`,
      {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token") || ""}`,
          userId: localStorage.getItem("userId"),
        },
      }
    );

    dispatch(getAllBookingSuccess(response.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to load bookings";
    dispatch(getBookingFailure(errMsg));
    toast.error(errMsg);
  }
};

export const downloadBusTicket = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest());

  const token = getState().auth.accessToken || localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/bus/download-bus-ticket`,
      {
        params: { bookingId },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      }
    );

    // ✅ Extract filename from Content-Disposition header
    const disposition = response.headers["content-disposition"];
    let filename = "ticket.pdf";

    if (disposition && disposition.includes("filename")) {
      const match = disposition.match(
        /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/
      );
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    // ✅ Trigger download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    dispatch(getDownloadSuccess());
    toast.success("Ticket downloaded!");
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to download ticket";
    dispatch(getDownloadFailure(message));
    toast.error(message);
  }
};

export const mailBusTicketPdf = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest());
  const token = getState().auth.accessToken;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/bus/mail-bus-ticket`,
      {
        params: { bookingId },
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token") || ""}`,
        },
      }
    );

    dispatch(getDownloadSuccess());
    toast.success("Ticket mailed successfully!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to mail ticket";
    dispatch(getDownloadFailure(errMsg));
    toast.error(errMsg);
  }
};

export const cancelBusTicket = (bookingId) => async (dispatch, getState) => {
  dispatch(getDownloadRequest());
  const token = getState().auth.accessToken;

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/bus/cancel-bus-ticket`,
      {
        bookingId: bookingId,
      },
      {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token") || ""}`,
        },
      }
    );

    dispatch(getDownloadSuccess());
    toast.success("Ticket Cancelled successfully!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to Cancelled ticket";
    dispatch(getDownloadFailure(errMsg));
    toast.error(errMsg);
  }
};
