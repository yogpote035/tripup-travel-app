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

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay SDK"));
    document.body.appendChild(script);
  });

export const bookFlightSeat =
  (bookingData, navigate) => async (dispatch, getState) => {
    dispatch(bookFlightRequest());

    try {
      const token = getState().auth.accessToken || localStorage.getItem("token");

      const pendingBooking = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/pending`,
        {
          bookingType: "flight",
          resource: bookingData.flightId,
          route: {
            from: bookingData.from,
            to: bookingData.to,
            journeyDate: bookingData.journeyDate,
          },
          passengers: bookingData.passengers.map((passenger) => ({
            name: passenger.name,
            email: passenger.email,
            phone: passenger.phone,
            gender: passenger.gender,
            seatNumber: passenger.seatNumber,
          })),
          seatNumbers: bookingData.passengers.map((passenger) => String(passenger.seatNumber)),
          amount: Number(bookingData.amount || 0),
          paymentMethod: "card",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const booking = pendingBooking.data?.data?.booking;
      const paymentOrder = pendingBooking.data?.data?.payment?.order;
      const paymentKeyId = pendingBooking.data?.data?.payment?.paymentKeyId;

      if (!booking || !paymentOrder || !paymentKeyId) {
        const backendMessage = pendingBooking.data?.message || "Payment order could not be created";
        throw new Error(backendMessage);
      }

      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: paymentKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "TripUp Flights",
        description: `Flight booking for ${bookingData.from} → ${bookingData.to}`,
        order_id: paymentOrder.id,
        handler: async (paymentResponse) => {
          try {
            const confirmRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/bookings/${booking._id}/payment-success`,
              {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            dispatch(bookFlightSuccess(confirmRes.data?.data || booking));
            toast.success("Flight booked successfully!");
            navigate("/flight-bookings");
          } catch (confirmationError) {
            const errMsg = "Payment received. Your booking is being confirmed. Please check your bookings shortly.";
            dispatch(bookFlightFailure(errMsg));
            toast.info(errMsg);
          }
        },
        modal: {
          ondismiss: () => {
            const msg = "Payment window closed before completion.";
            dispatch(bookFlightFailure(msg));
            toast.error(msg);
          },
        },
        prefill: {
          name: bookingData.passengers?.[0]?.name || "",
          email: bookingData.passengers?.[0]?.email || "",
        },
        theme: {
          color: "#f97316",
        },
      });

      razorpay.open();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Flight booking failed";
      dispatch(bookFlightFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const fetchMyFlightBookings = () => async (dispatch, getState) => {
  dispatch(getMyFlightBookingsRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");

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
