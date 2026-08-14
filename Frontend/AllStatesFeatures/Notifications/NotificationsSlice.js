import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications?page=${page}&limit=${limit}`, { withCredentials: true });
        return res.data || { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    } catch (e) { return rejectWithValue(e.message); }
});

export const fetchUnreadCount = createAsyncThunk('notifications/unread', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications/unread-count`, { withCredentials: true });
        return res.data?.data?.count || 0;
    } catch (e) { return rejectWithValue(e.message); }
});

export const markRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/notifications/mark-read`, { id }, { withCredentials: true });
        return id;
    } catch (e) { return rejectWithValue(e.message); }
});

export const markAllRead = createAsyncThunk('notifications/markAll', async (_, { rejectWithValue }) => {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/notifications/mark-all-read`, {}, { withCredentials: true });
        return true;
    } catch (e) { return rejectWithValue(e.message); }
});

export const clearAllNotifications = createAsyncThunk('notifications/clearAll', async (_, { rejectWithValue }) => {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/notifications/clear-all`, {}, { withCredentials: true });
        return true;
    } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
    name: 'notifications',
    initialState: { items: [], unread: 0, loading: false, error: null, pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
    reducers: {
        receiveNotification(state, action) {
            state.items.unshift(action.payload);
            state.unread += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.data || []; s.pagination = a.payload.pagination || s.pagination; })
            .addCase(fetchNotifications.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })
            .addCase(fetchUnreadCount.fulfilled, (s, a) => { s.unread = a.payload; })
            .addCase(markRead.fulfilled, (s, a) => { s.items = s.items.map((it) => (it._id === a.payload || it.id === a.payload ? { ...it, read: true } : it)); s.unread = Math.max(0, s.unread - 1); })
            .addCase(markAllRead.fulfilled, (s) => { s.items = s.items.map((it) => ({ ...it, read: true })); s.unread = 0; })
            .addCase(clearAllNotifications.fulfilled, (s) => { s.items = []; s.unread = 0; s.pagination = { ...s.pagination, total: 0, pages: 0 }; });
    }
});

export const { receiveNotification } = slice.actions;
export default slice.reducer;
