import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const request = (path, options = {}) => axios({ url: `/admin${path}`, ...options }).then((response) => response.data.data);
const queryString = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)).toString();

export const fetchDashboard = createAsyncThunk("admin/dashboard", () => request("/dashboard"));
export const fetchAdminUsers = createAsyncThunk("admin/users", (params) => request(`/users?${queryString(params)}`));
export const updateAdminUserStatus = createAsyncThunk("admin/userStatus", ({ id, isActive }) => request(`/users/${id}/status`, { method: "patch", data: { isActive } }));
export const fetchAdminBookings = createAsyncThunk("admin/bookings", (params) => request(`/bookings?${queryString(params)}`));
export const fetchAdminPosts = createAsyncThunk("admin/posts", (params) => request(`/posts?${queryString(params)}`));
export const removeAdminPost = createAsyncThunk("admin/removePost", async (id) => { await request(`/posts/${id}`, { method: "delete" }); return id; });
export const fetchAdmins = createAsyncThunk("admin/admins", (params) => request(`/admins?${queryString(params)}`));
export const createAdmin = createAsyncThunk("admin/createAdmin", (payload) => request("/admins", { method: "post", data: payload }));
export const updateAdminStatus = createAsyncThunk("admin/adminStatus", ({ id, isActive }) => request(`/admins/${id}/status`, { method: "patch", data: { isActive } }));

const makeCollection = () => ({ items: [], pagination: { page: 1, pages: 0, total: 0 }, loading: false, error: null });
const adminSlice = createSlice({
  name: "admin", initialState: { dashboard: { data: null, loading: false, error: null }, users: makeCollection(), bookings: makeCollection(), posts: makeCollection(), admins: makeCollection() }, reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboard.pending, (state) => { state.dashboard.loading = true; state.dashboard.error = null; }).addCase(fetchDashboard.fulfilled, (state, action) => { state.dashboard.loading = false; state.dashboard.data = action.payload; }).addCase(fetchDashboard.rejected, (state, action) => { state.dashboard.loading = false; state.dashboard.error = action.error.message; });
    [[fetchAdminUsers, "users"], [fetchAdminBookings, "bookings"], [fetchAdminPosts, "posts"], [fetchAdmins, "admins"]].forEach(([thunk, key]) => builder.addCase(thunk.pending, (state) => { state[key].loading = true; state[key].error = null; }).addCase(thunk.fulfilled, (state, action) => { state[key].loading = false; state[key].items = action.payload.items; state[key].pagination = action.payload.pagination; }).addCase(thunk.rejected, (state, action) => { state[key].loading = false; state[key].error = action.error.message; }));
    builder.addCase(updateAdminUserStatus.fulfilled, (state, action) => { const user = state.users.items.find((item) => item._id === action.payload._id); if (user) user.isActive = action.payload.isActive; });
    builder.addCase(removeAdminPost.fulfilled, (state, action) => { state.posts.items = state.posts.items.filter((item) => item._id !== action.payload); state.posts.pagination.total = Math.max(0, state.posts.pagination.total - 1); });
    builder.addCase(createAdmin.fulfilled, (state, action) => { state.admins.items.unshift(action.payload); state.admins.pagination.total += 1; });
    builder.addCase(updateAdminStatus.fulfilled, (state, action) => { const admin = state.admins.items.find((item) => item._id === action.payload._id); if (admin) admin.isActive = action.payload.isActive; });
  },
});
export default adminSlice.reducer;
