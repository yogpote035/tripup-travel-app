import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  loadingMore: false,
  success: false,
  error: null,
  itinerary: [],
  selectedItinerary: null,
  lastAction: null,
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
      state.lastAction = "create";
    },
    createItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedItinerary = action.payload?.itinerary || action.payload || null;
      if (Array.isArray(state.itinerary)) {
        state.itinerary = [action.payload?.itinerary || action.payload, ...state.itinerary];
      }
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
      state.lastAction = "list";
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
    getItineraryByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.lastAction = "detail";
    },
    getItineraryByIdSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedItinerary = action.payload;
    },
    getItineraryByIdFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    updateItineraryRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.lastAction = "update";
    },
    updateItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedItinerary = action.payload;
      state.itinerary = Array.isArray(state.itinerary)
        ? state.itinerary.map((item) => (item._id === action.payload?._id ? action.payload : item))
        : [];
    },
    updateItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    duplicateItineraryRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.lastAction = "duplicate";
    },
    duplicateItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      if (Array.isArray(state.itinerary)) state.itinerary = [action.payload, ...state.itinerary];
    },
    duplicateItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    shareItineraryRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.lastAction = "share";
    },
    shareItinerarySuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    shareItineraryFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    regenerateDayRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.lastAction = "regenerate-day";
    },
    regenerateDaySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedItinerary = action.payload;
      state.itinerary = Array.isArray(state.itinerary)
        ? state.itinerary.map((item) => (item._id === action.payload?._id ? action.payload : item))
        : [];
    },
    regenerateDayFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    deleteItineraryRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
      state.lastAction = "delete";
    },
    deleteItinerarySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.itinerary = Array.isArray(state.itinerary)
        ? state.itinerary.filter((item) => item._id !== action.payload)
        : [];
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
  getItineraryByIdRequest,
  getItineraryByIdSuccess,
  getItineraryByIdFailure,
  updateItineraryRequest,
  updateItinerarySuccess,
  updateItineraryFailure,
  duplicateItineraryRequest,
  duplicateItinerarySuccess,
  duplicateItineraryFailure,
  shareItineraryRequest,
  shareItinerarySuccess,
  shareItineraryFailure,
  regenerateDayRequest,
  regenerateDaySuccess,
  regenerateDayFailure,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;

export const generateItinerary =
  (formData, navigate) => async (dispatch, getState) => {
    console.log("[Itinerary] generateItinerary called", { formData, hasToken: !!(getState().auth.accessToken || localStorage.getItem("token")) });
    dispatch(createItineraryRequest());

    try {
      const token = getState().auth.accessToken || localStorage.getItem("token");
      console.log("[Itinerary] sending POST to /itinerary/generate", {
        url: `${import.meta.env.VITE_API_BASE_URL}/itinerary/generate`,
        tokenPresent: !!token,
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/itinerary/generate`,
        formData,
        {
          timeout: 60000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("[Itinerary] response received", { status: res.status, data: res.data });

      if (res.status === 208 || res.status === 406) {
        const msg = res.data?.message || "Failed to create itinerary";
        dispatch(createItineraryFailure(msg));
        return toast.error(msg);
      }

      dispatch(createItinerarySuccess({ itinerary: res.data.itinerary || { _id: res.data.itineraryId, plan: res.data.plan }, plan: res.data.plan }));
      toast.success(res.data.source === "template" ? "Itinerary generated with a ready-made template." : "Itinerary created successfully!");
      navigate("/itinerary");
    } catch (error) {
      console.error("[Itinerary] request failed", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const errMsg = error.response?.data?.message || "Something went wrong!";
      dispatch(createItineraryFailure(errMsg));
      toast.error(errMsg);
    }
  };

let currentController = null;

export const getAllItinerary = (page = 1, limit = 10, append = false, search = "") => async (dispatch, getState) => {
  dispatch(getAllItineraryRequest());

  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    // cancel previous request if inflight
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    const url = `${import.meta.env.VITE_API_BASE_URL}/itinerary/get-all?${params.toString()}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: currentController.signal,
    });

    if (res.status === 208) return dispatch(getAllItineraryFailure(""));

    // Support both legacy array response and paginated payload
    const payload = Array.isArray(res.data) ? { items: res.data, total: res.data.length, page: 1, pages: 1 } : res.data;

    if (append) {
      const merged = Array.isArray(getState().itinerary.itinerary) ? [...getState().itinerary.itinerary, ...payload.items] : payload.items;
      dispatch(getAllItinerarySuccess(merged));
    } else {
      dispatch(getAllItinerarySuccess(payload.items));
    }

    return payload;
  } catch (error) {
    if (error.name === 'CanceledError' || error.message === 'canceled') {
      // request was cancelled - do not notify
      return;
    }
    const errMsg = error.response?.data?.message || "Failed! to Get Itinerary";
    dispatch(getAllItineraryFailure(errMsg));
    toast.error(errMsg);
  } finally {
    currentController = null;
  }
};

export const getItineraryById = (itineraryId) => async (dispatch) => {
  dispatch(getItineraryByIdRequest());
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/itinerary/${itineraryId}`);
    dispatch(getItineraryByIdSuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch itinerary";
    dispatch(getItineraryByIdFailure(errMsg));
    toast.error(errMsg);
  }
};

export const updateItinerary = (itineraryId, payload) => async (dispatch, getState) => {
  dispatch(updateItineraryRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/itinerary/${itineraryId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(updateItinerarySuccess(res.data.itinerary));
    toast.success("Itinerary updated successfully!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to update itinerary";
    dispatch(updateItineraryFailure(errMsg));
    toast.error(errMsg);
  }
};

export const duplicateItinerary = (itineraryId) => async (dispatch, getState) => {
  dispatch(duplicateItineraryRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/itinerary/${itineraryId}/duplicate`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(duplicateItinerarySuccess(res.data.itinerary));
    toast.success("Itinerary duplicated successfully!");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to duplicate itinerary";
    dispatch(duplicateItineraryFailure(errMsg));
    toast.error(errMsg);
  }
};

const safeCopyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const successful = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!successful) throw new Error("Clipboard copy failed");
};

export const shareItinerary = (itineraryId) => async (dispatch, getState) => {
  dispatch(shareItineraryRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/itinerary/${itineraryId}/share`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const shareUrl = res.data?.shareUrl || `${window.location.origin}/itinerary/${itineraryId}`;
    if (!shareUrl) {
      throw new Error("Share link was not returned by the server");
    }

    await safeCopyToClipboard(shareUrl);
    dispatch(shareItinerarySuccess());
    toast.success("Share link copied to clipboard");
    return { success: true, shareUrl };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || "Failed to share itinerary";
    dispatch(shareItineraryFailure(errMsg));
    toast.error(errMsg);
    return { success: false, error: errMsg };
  }
};

export const regenerateDay = (itineraryId, dayNumber, date) => async (dispatch, getState) => {
  dispatch(regenerateDayRequest());
  try {
    if (!itineraryId) throw new Error("Itinerary id is required");
    if (!dayNumber && dayNumber !== 0) throw new Error("dayNumber is required to regenerate a day");
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const payload = { dayNumber: Number(dayNumber) };
    if (date) payload.date = date;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/itinerary/${itineraryId}/regenerate-day`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(regenerateDaySuccess(res.data.itinerary));
    toast.success("Selected day regenerated successfully!");
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message || "Failed to regenerate day";
    dispatch(regenerateDayFailure(errMsg));
    toast.error(errMsg);
  }
};

export const DeleteItinerary = (itineraryId) => async (dispatch, getState) => {
  dispatch(deleteItineraryRequest());

  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");

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
