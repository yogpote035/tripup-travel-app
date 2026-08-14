import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Fetch locations
export const fetchLocations = createAsyncThunk(
    "locations/fetchLocations",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations`, {
                params,
                withCredentials: true,
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch locations");
        }
    }
);

// Fetch popular locations
export const fetchPopularLocations = createAsyncThunk(
    "locations/fetchPopularLocations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations/popular`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch popular locations");
        }
    }
);

// Fetch location detail
export const fetchLocationDetail = createAsyncThunk(
    "locations/fetchLocationDetail",
    async (locationId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations/${locationId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch location");
        }
    }
);

// Fetch location posts
export const fetchLocationPosts = createAsyncThunk(
    "locations/fetchLocationPosts",
    async ({ locationId, params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations/${locationId}/posts`, {
                params,
                withCredentials: true,
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch posts");
        }
    }
);

// Fetch location reviews
export const fetchLocationReviews = createAsyncThunk(
    "locations/fetchLocationReviews",
    async ({ locationId, params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations/${locationId}/reviews`, {
                params,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch reviews");
        }
    }
);

// Add location review
export const addLocationReview = createAsyncThunk(
    "locations/addLocationReview",
    async ({ locationId, rating, reviewText }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/locations/${locationId}/reviews`,
                { rating, reviewText },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add review");
        }
    }
);

// Search locations
export const searchLocations = createAsyncThunk(
    "locations/searchLocations",
    async (query, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/locations/search`, {
                params: { q: query },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Search failed");
        }
    }
);

export const createLocation = createAsyncThunk(
    "locations/createLocation",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/locations`, payload, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create location");
        }
    }
);

// Mark as visitor
export const markLocationVisitor = createAsyncThunk(
    "locations/markLocationVisitor",
    async (locationId, { rejectWithValue }) => {
        try {
            await axios.post(`${API_BASE_URL}/locations/${locationId}/visitor`, {}, {
                withCredentials: true,
            });
            return locationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark visitor");
        }
    }
);

const initialState = {
    locations: [],
    popularLocations: [],
    currentLocation: null,
    locationPosts: [],
    locationReviews: { reviews: [], avgRating: 0, reviewCount: 0 },
    searchResults: [],
    loading: false,
    loadingDetail: false,
    loadingReviews: false,
    error: null,
    pagination: { page: 1, limit: 12 },
};

const locationSlice = createSlice({
    name: "locations",
    initialState,
    reducers: {
        clearLocationDetail: (state) => {
            state.currentLocation = null;
        },
        clearLocationPosts: (state) => {
            state.locationPosts = [];
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
    },
    extraReducers: (builder) => {
        // Fetch locations
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.locations = action.payload.items || [];
                state.pagination = action.payload.pagination || {};
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch popular locations
        builder
            .addCase(fetchPopularLocations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPopularLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.popularLocations = action.payload;
            })
            .addCase(fetchPopularLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch location detail
        builder
            .addCase(fetchLocationDetail.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchLocationDetail.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.currentLocation = action.payload;
            })
            .addCase(fetchLocationDetail.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload;
            });

        // Fetch location posts
        builder
            .addCase(fetchLocationPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLocationPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.locationPosts = action.payload.items || [];
            })
            .addCase(fetchLocationPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch location reviews
        builder
            .addCase(fetchLocationReviews.pending, (state) => {
                state.loadingReviews = true;
            })
            .addCase(fetchLocationReviews.fulfilled, (state, action) => {
                state.loadingReviews = false;
                state.locationReviews = action.payload;
            })
            .addCase(fetchLocationReviews.rejected, (state, action) => {
                state.loadingReviews = false;
                state.error = action.payload;
            });

        // Add location review
        builder
            .addCase(addLocationReview.fulfilled, (state, action) => {
                if (state.currentLocation) {
                    state.currentLocation.avgRating = action.payload.avgRating;
                    state.currentLocation.reviewCount = action.payload.reviewCount;
                }
            })
            .addCase(addLocationReview.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Search locations
        builder
            .addCase(searchLocations.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create location
        builder
            .addCase(createLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLocation.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload._id) {
                    state.locations.unshift(action.payload);
                }
            })
            .addCase(createLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearLocationDetail, clearLocationPosts, clearSearchResults } =
    locationSlice.actions;

export default locationSlice.reducer;
