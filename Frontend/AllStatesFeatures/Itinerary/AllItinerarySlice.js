import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  success: false,
  error: null,
  itinerary: null,
};

const itinerarySlice = createSlice({
  name: "itinerary",
  initialState,
  reducers: {
    // Create Itinerary
    createItineraryRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      //   state.itinerary = action.payload;
    },
    createItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    // Get All Itinerary
    getAllItineraryRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    getAllItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.itinerary = action.payload || [];
    },
    getAllItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    getAllResetItinerary: () => initialState,
    //  Delete Itinerary
    deleteItineraryRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    deleteItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.itinerary = state.itinerary.filter(
        (item) => item._id !== action.payload
      );
    },
    deleteItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    deleteResetItinerary: () => initialState,
  },
});

export const {
  createItineraryRequest,
  createItinerarySuccess,
  createItineraryFailure,
  resetItinerary,
  getAllItineraryRequest,
  getAllItinerarySuccess,
  getAllItineraryFailure,
  getAllResetItinerary,
  deleteItineraryRequest,
  deleteItinerarySuccess,
  deleteItineraryFailure,
  deleteResetItinerary,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;

export const generateItinerary =
  (formData, navigate) => async (dispatch, getState) => {
    dispatch(createItineraryRequest());

    try {
      const token = getState().auth.token || localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/itinerary/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 208 || res.status === 406) {
        const msg = res.data?.message || "Failed to create itinerary";
        dispatch(createItineraryFailure(msg));
        return toast.error(msg);
      }

      dispatch(createItinerarySuccess(res.data.plan));
      toast.success("Itinerary created successfully!");
      navigate("/itinerary");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong!";
      dispatch(createItineraryFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const getAllItinerary = () => async (dispatch, getState) => {
  dispatch(getAllItineraryRequest());

  try {
    const token = getState().auth.token || localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/itinerary/get-all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 208) {
      const msg = res.data?.message || "Itinerary Not Found";
      return dispatch(getAllItineraryFailure(""));
    }

    dispatch(getAllItinerarySuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed! to Get Itinerary";
    dispatch(getAllItineraryFailure(errMsg));
    toast.error(errMsg);
  }
};

export const DeleteItinerary = (itineraryId) => async (dispatch, getState) => {
  dispatch(deleteItineraryRequest());

  try {
    const token = getState().auth.token || localStorage.getItem("token");

    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/itinerary/delete/${itineraryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 208) {
      const msg = res.data?.message || "Itinerary Not Found";
      dispatch(deleteItineraryFailure(msg));
      return toast.error(msg);
    }

    if (res.status === 203) {
      const msg =
        res.data?.message ||
        "Unauthorized Access ,Your not Owner of this Itinerary";
      dispatch(deleteItineraryFailure(msg));
      return toast.warning(msg);
    }

    if (res.status === 204) {
      const msg = res.data?.message || "Itinerary Id is Not Found";
      dispatch(deleteItineraryFailure(msg));
      return toast.error(msg);
    }

    dispatch(deleteItinerarySuccess(itineraryId));
    toast.success("Itinerary Deleted successfully!");
  } catch (error) {
    const errMsg =
      error.response?.data?.message || "Failed! to Delete Itinerary";
    dispatch(deleteItineraryFailure(errMsg));
    toast.error(errMsg);
  }
};
