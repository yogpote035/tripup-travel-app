import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Get saved posts
export const fetchSavedPosts = createAsyncThunk(
    "savedPosts/fetchSavedPosts",
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.accessToken || localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/posts/bookmarks`, {
                params,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch saved posts");
        }
    }
);

// Toggle bookmark
export const toggleBookmark = createAsyncThunk(
    "savedPosts/toggleBookmark",
    async (postId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.accessToken || localStorage.getItem("token");
            const response = await axios.put(`${API_BASE_URL}/posts/${postId}/bookmark`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return { postId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle bookmark");
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    totalCount: 0,
    pagination: { page: 1, limit: 12 },
    bookmarkedPostIds: [],
};

const savedPostsSlice = createSlice({
    name: "savedPosts",
    initialState,
    reducers: {
        clearSavedPosts: (state) => {
            state.items = [];
            state.error = null;
        },
        setBookmarkedIds: (state, action) => {
            state.bookmarkedPostIds = action.payload;
        },
        addBookmarkedId: (state, action) => {
            if (!state.bookmarkedPostIds.includes(action.payload)) {
                state.bookmarkedPostIds.push(action.payload);
            }
        },
        removeBookmarkedId: (state, action) => {
            state.bookmarkedPostIds = state.bookmarkedPostIds.filter(
                (id) => id !== action.payload
            );
        },
    },
    extraReducers: (builder) => {
        // Fetch saved posts
        builder
            .addCase(fetchSavedPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSavedPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
                state.totalCount = action.payload?.length || 0;
            })
            .addCase(fetchSavedPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Toggle bookmark
        builder
            .addCase(toggleBookmark.pending, (state) => {
                state.error = null;
            })
            .addCase(toggleBookmark.fulfilled, (state, action) => {
                const { postId, bookmarked } = action.payload;
                if (bookmarked) {
                    state.bookmarkedPostIds.push(postId);
                } else {
                    state.bookmarkedPostIds = state.bookmarkedPostIds.filter(
                        (id) => id !== postId
                    );
                }
            })
            .addCase(toggleBookmark.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    clearSavedPosts,
    setBookmarkedIds,
    addBookmarkedId,
    removeBookmarkedId,
} = savedPostsSlice.actions;

export default savedPostsSlice.reducer;
