import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const fetchLikedPosts = createAsyncThunk(
    "likedPosts/fetchLikedPosts",
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.accessToken || localStorage.getItem("token");
            const res = await axios.get(`${API_BASE_URL}/posts/likes`, {
                params,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch liked posts");
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 12 },
};

const likedPostsSlice = createSlice({
    name: "likedPosts",
    initialState,
    reducers: {
        clearLikedPosts: (state) => {
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLikedPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLikedPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : (action.payload.items || []);
            })
            .addCase(fetchLikedPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearLikedPosts } = likedPostsSlice.actions;
export default likedPostsSlice.reducer;
