import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const request = async (path, options = {}) => {
  try {
    const response = await axios({ url: `/admin${path}`, ...options });
    return response.data.data;
  } catch (error) {
    const payload = error.response?.data;
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((item) => item.message || item.msg || item).filter(Boolean).join("; ")
      : "";
    const message = details || payload?.message || payload?.error || error.message || "The request could not be completed";
    const requestId = error.response?.headers?.["x-request-id"];
    const enrichedError = new Error(requestId ? `${message} (Request ID: ${requestId})` : message);
    enrichedError.status = error.response?.status;
    throw enrichedError;
  }
};
const queryString = (params = {}) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)).toString();

// ============ EXISTING THUNKS ============
export const fetchDashboard = createAsyncThunk("admin/dashboard", () => request("/dashboard"));
export const fetchAdminUsers = createAsyncThunk("admin/users", (params) => request(`/users?${queryString(params)}`));
export const updateAdminUserStatus = createAsyncThunk("admin/userStatus", ({ id, isActive }) => request(`/users/${id}/status`, { method: "patch", data: { isActive } }));
export const fetchAdminBookings = createAsyncThunk("admin/bookings", (params) => request(`/bookings?${queryString(params)}`));
export const fetchAdminPosts = createAsyncThunk("admin/posts", (params) => request(`/posts?${queryString(params)}`));
export const removeAdminPost = createAsyncThunk("admin/removePost", async (id) => { await request(`/posts/${id}`, { method: "delete" }); return id; });
export const fetchAdmins = createAsyncThunk("admin/admins", (params) => request(`/admins?${queryString(params)}`));
export const createAdmin = createAsyncThunk("admin/createAdmin", (payload) => request("/admins", { method: "post", data: payload }));
export const updateAdminStatus = createAsyncThunk("admin/adminStatus", ({ id, isActive }) => request(`/admins/${id}/status`, { method: "patch", data: { isActive } }));
export const createAdminAnnouncement = createAsyncThunk("admin/createAnnouncement", async (payload) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const response = await axios({ url: `${apiBase}/notifications/announce`, method: "post", data: payload });
  return response.data;
});
// ============ LOCATION THUNKS ============
export const fetchAdminLocations = createAsyncThunk("admin/locations", (params) => request(`/locations?${queryString(params)}`));
export const createAdminLocation = createAsyncThunk("admin/createLocation", (payload) => request("/locations", { method: "post", data: payload }));
export const updateAdminLocation = createAsyncThunk("admin/updateLocation", ({ id, payload }) => request(`/locations/${id}`, { method: "patch", data: payload }));
export const deleteAdminLocation = createAsyncThunk("admin/deleteLocation", async (id) => { await request(`/locations/${id}`, { method: "delete" }); return id; });
export const fetchAdminHotels = createAsyncThunk("admin/hotels", (params) => request(`/hotels?${queryString(params)}`));
export const fetchAdminHotelBookings = createAsyncThunk("admin/hotelBookings", ({ hotelId, params }) => {
  const query = queryString(params || {});
  return request(`/hotels/${hotelId}/bookings${query ? `?${query}` : ""}`);
});
export const createAdminHotel = createAsyncThunk("admin/createHotel", (payload) => request("/hotels", { method: "post", data: payload }));
export const updateAdminHotel = createAsyncThunk("admin/updateHotel", ({ id, payload }) => request(`/hotels/${id}`, { method: "patch", data: payload }));
export const deleteAdminHotel = createAsyncThunk("admin/deleteHotel", async (id) => { await request(`/hotels/${id}`, { method: "delete" }); return id; });
export const fetchAdminFlights = createAsyncThunk("admin/flights", (params) => request(`/flights?${queryString(params)}`));
export const createAdminFlight = createAsyncThunk("admin/createFlight", (payload) => request("/flights", { method: "post", data: payload }));
export const updateAdminFlight = createAsyncThunk("admin/updateFlight", async ({ id, payload }) => {
  if (!id) throw new Error("A flight ID is required to update a flight");
  return request(`/flights/${encodeURIComponent(id)}`, { method: "patch", data: payload });
});
export const deleteAdminFlight = createAsyncThunk("admin/deleteFlight", async (id) => { await request(`/flights/${id}`, { method: "delete" }); return id; });
export const bulkDeleteAdminFlights = createAsyncThunk("admin/bulkDeleteFlights", async (ids) => { const data = await request("/flights/bulk", { method: "delete", data: { ids } }); return { ids, ...data }; });
export const importAdminFlights = createAsyncThunk("admin/importFlights", (flights) => request("/flights/import", { method: "post", data: { flights } }));
export const fetchAdminTrains = createAsyncThunk("admin/trains", (params) => request(`/trains?${queryString(params)}`));
export const createAdminTrain = createAsyncThunk("admin/createTrain", (payload) => request("/trains", { method: "post", data: payload }));
export const updateAdminTrain = createAsyncThunk("admin/updateTrain", async ({ id, payload }) => {
  if (!id) throw new Error("A train ID is required to update a train");
  return request(`/trains/${encodeURIComponent(id)}`, { method: "patch", data: payload });
});
export const deleteAdminTrain = createAsyncThunk("admin/deleteTrain", async (id) => { await request(`/trains/${id}`, { method: "delete" }); return id; });
export const fetchAdminBuses = createAsyncThunk("admin/buses", (params) => request(`/buses?${queryString(params)}`));
export const createAdminBus = createAsyncThunk("admin/createBus", (payload) => request("/buses", { method: "post", data: payload }));
export const updateAdminBus = createAsyncThunk("admin/updateBus", async ({ id, payload }) => {
  if (!id) throw new Error("A bus ID is required to update a bus");
  return request(`/buses/${encodeURIComponent(id)}`, { method: "patch", data: payload });
});
export const deleteAdminBus = createAsyncThunk("admin/deleteBus", async (id) => { await request(`/buses/${id}`, { method: "delete" }); return id; });

// ============ NEW AUDIT & SYSTEM THUNKS ============
export const fetchAuditLogs = createAsyncThunk("admin/auditLogs", (params) => request(`/audit-logs?${queryString(params)}`));
export const fetchUserAuditLogs = createAsyncThunk("admin/userLogs", ({ userId, params }) => request(`/audit-logs/user/${userId}?${queryString(params)}`));
export const fetchAdminAuditLogs = createAsyncThunk("admin/adminLogs", (params) => request(`/audit-logs/admin?${queryString(params)}`));
export const fetchSystemMetrics = createAsyncThunk("admin/metrics", () => request("/system/metrics"));
export const fetchSystemErrors = createAsyncThunk("admin/systemErrors", (hours) => request(`/system/errors?hours=${hours}`));
export const fetchActivityStats = createAsyncThunk("admin/stats", (days) => request(`/system/stats?days=${days}`));
export const fetchBackups = createAsyncThunk("admin/backups", (params) => request(`/backup/list?${queryString(params)}`));
export const createBackup = createAsyncThunk(
  "admin/createBackup",
  (description) => request("/backup/create", { method: "post", data: { description } })
);
export const restoreBackup = createAsyncThunk("admin/restoreBackup", (backupId) => request("/backup/restore", { method: "post", data: { backupId } }));
export const deleteBackup = createAsyncThunk("admin/deleteBackup", (backupId) => request(`/backup/${backupId}`, { method: "delete" }));

const makeCollection = () => ({ items: [], pagination: { page: 1, pages: 0, total: 0 }, loading: false, error: null });
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboard: { data: null, loading: false, error: null },
    users: makeCollection(),
    bookings: makeCollection(),
    hotelBookings: makeCollection(),
    posts: makeCollection(),
    admins: makeCollection(),
    flights: makeCollection(),
    trains: makeCollection(),
    buses: makeCollection(),
    locations: makeCollection(),
    hotels: makeCollection(),
    // New states for audit & system
    auditLogs: makeCollection(),
    userLogs: { user: null, logs: [], pagination: {} },
    adminLogs: makeCollection(),
    systemMetrics: { data: null, loading: false, error: null },
    systemErrors: { data: null, loading: false, error: null },
    activityStats: { data: null, loading: false, error: null },
    backups: makeCollection(),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboard.pending, (state) => { state.dashboard.loading = true; state.dashboard.error = null; }).addCase(fetchDashboard.fulfilled, (state, action) => { state.dashboard.loading = false; state.dashboard.data = action.payload; }).addCase(fetchDashboard.rejected, (state, action) => { state.dashboard.loading = false; state.dashboard.error = action.error.message; });
    [[fetchAdminUsers, "users"], [fetchAdminBookings, "bookings"], [fetchAdminPosts, "posts"], [fetchAdmins, "admins"], [fetchAdminFlights, "flights"], [fetchAdminTrains, "trains"], [fetchAdminBuses, "buses"], [fetchAdminLocations, "locations"], [fetchAdminHotels, "hotels"]].forEach(([thunk, key]) => builder.addCase(thunk.pending, (state) => { state[key].loading = true; state[key].error = null; }).addCase(thunk.fulfilled, (state, action) => { state[key].loading = false; state[key].items = action.payload.items; state[key].pagination = action.payload.pagination; }).addCase(thunk.rejected, (state, action) => { state[key].loading = false; state[key].error = action.error.message; }));
    builder.addCase(fetchAdminHotelBookings.pending, (state) => { state.hotelBookings.loading = true; state.hotelBookings.error = null; }).addCase(fetchAdminHotelBookings.fulfilled, (state, action) => { state.hotelBookings.loading = false; state.hotelBookings.items = action.payload.items; state.hotelBookings.pagination = action.payload.pagination; }).addCase(fetchAdminHotelBookings.rejected, (state, action) => { state.hotelBookings.loading = false; state.hotelBookings.error = action.error.message; });
    builder.addCase(updateAdminUserStatus.fulfilled, (state, action) => { const user = state.users.items.find((item) => item._id === action.payload._id); if (user) user.isActive = action.payload.isActive; });
    builder.addCase(removeAdminPost.fulfilled, (state, action) => { state.posts.items = state.posts.items.filter((item) => item._id !== action.payload); state.posts.pagination.total = Math.max(0, state.posts.pagination.total - 1); });
    builder.addCase(createAdmin.fulfilled, (state, action) => { state.admins.items.unshift(action.payload); state.admins.pagination.total += 1; });
    builder.addCase(updateAdminStatus.fulfilled, (state, action) => { const admin = state.admins.items.find((item) => item._id === action.payload._id); if (admin) admin.isActive = action.payload.isActive; });
    builder.addCase(createAdminFlight.fulfilled, (state, action) => { state.flights.items.unshift(action.payload); state.flights.pagination.total += 1; });
    builder.addCase(updateAdminFlight.fulfilled, (state, action) => { const index = state.flights.items.findIndex((item) => item._id === action.payload._id); if (index >= 0) state.flights.items[index] = action.payload; });
    builder.addCase(deleteAdminFlight.fulfilled, (state, action) => { state.flights.items = state.flights.items.filter((item) => item._id !== action.payload); state.flights.pagination.total = Math.max(0, state.flights.pagination.total - 1); });
    builder.addCase(bulkDeleteAdminFlights.fulfilled, (state, action) => { const ids = new Set(action.payload.ids); state.flights.items = state.flights.items.filter((item) => !ids.has(item._id)); state.flights.pagination.total = Math.max(0, state.flights.pagination.total - action.payload.deletedCount); });
    builder.addCase(createAdminTrain.fulfilled, (state, action) => { state.trains.items.unshift(action.payload); state.trains.pagination.total += 1; });
    builder.addCase(updateAdminTrain.fulfilled, (state, action) => { const index = state.trains.items.findIndex((item) => item._id === action.payload._id); if (index >= 0) state.trains.items[index] = action.payload; });
    builder.addCase(deleteAdminTrain.fulfilled, (state, action) => { state.trains.items = state.trains.items.filter((item) => item._id !== action.payload); state.trains.pagination.total = Math.max(0, state.trains.pagination.total - 1); });
    builder.addCase(createAdminBus.fulfilled, (state, action) => { state.buses.items.unshift(action.payload); state.buses.pagination.total += 1; });
    builder.addCase(updateAdminBus.fulfilled, (state, action) => { const index = state.buses.items.findIndex((item) => item._id === action.payload._id); if (index >= 0) state.buses.items[index] = action.payload; });
    builder.addCase(deleteAdminBus.fulfilled, (state, action) => { state.buses.items = state.buses.items.filter((item) => item._id !== action.payload); state.buses.pagination.total = Math.max(0, state.buses.pagination.total - 1); });
    // Locations CRUD handlers
    builder.addCase(createAdminLocation.fulfilled, (state, action) => { state.locations.items.unshift(action.payload); state.locations.pagination.total += 1; });
    builder.addCase(updateAdminLocation.fulfilled, (state, action) => { const idx = state.locations.items.findIndex((item) => item._id === action.payload._id); if (idx >= 0) state.locations.items[idx] = action.payload; });
    builder.addCase(deleteAdminLocation.fulfilled, (state, action) => { state.locations.items = state.locations.items.filter((item) => item._id !== action.payload); state.locations.pagination.total = Math.max(0, state.locations.pagination.total - 1); });
    builder.addCase(createAdminHotel.fulfilled, (state, action) => { state.hotels.items.unshift(action.payload); state.hotels.pagination.total += 1; });
    builder.addCase(updateAdminHotel.fulfilled, (state, action) => { const idx = state.hotels.items.findIndex((item) => item._id === action.payload._id); if (idx >= 0) state.hotels.items[idx] = action.payload; });
    builder.addCase(deleteAdminHotel.fulfilled, (state, action) => { const id = action.payload?.id || action.meta.arg; state.hotels.items = state.hotels.items.filter((item) => String(item._id) !== String(id)); state.hotels.pagination.total = Math.max(0, (state.hotels.pagination.total || 0) - 1); });

    // NEW: Audit Logs
    builder.addCase(fetchAuditLogs.pending, (state) => { state.auditLogs.loading = true; state.auditLogs.error = null; }).addCase(fetchAuditLogs.fulfilled, (state, action) => { state.auditLogs.loading = false; state.auditLogs.items = action.payload.items; state.auditLogs.pagination = action.payload.pagination; }).addCase(fetchAuditLogs.rejected, (state, action) => { state.auditLogs.loading = false; state.auditLogs.error = action.error.message; });

    // NEW: User Audit Logs
    builder.addCase(fetchUserAuditLogs.pending, (state) => { state.userLogs.loading = true; }).addCase(fetchUserAuditLogs.fulfilled, (state, action) => { state.userLogs.loading = false; state.userLogs.user = action.payload.user; state.userLogs.logs = action.payload.logs; state.userLogs.pagination = action.payload.pagination; }).addCase(fetchUserAuditLogs.rejected, (state, action) => { state.userLogs.loading = false; });

    // NEW: Admin Audit Logs
    builder.addCase(fetchAdminAuditLogs.pending, (state) => { state.adminLogs.loading = true; }).addCase(fetchAdminAuditLogs.fulfilled, (state, action) => { state.adminLogs.loading = false; state.adminLogs.items = action.payload.items; state.adminLogs.pagination = action.payload.pagination; }).addCase(fetchAdminAuditLogs.rejected, (state, action) => { state.adminLogs.loading = false; });

    // NEW: System Metrics
    builder.addCase(fetchSystemMetrics.pending, (state) => { state.systemMetrics.loading = true; }).addCase(fetchSystemMetrics.fulfilled, (state, action) => { state.systemMetrics.loading = false; state.systemMetrics.data = action.payload; }).addCase(fetchSystemMetrics.rejected, (state, action) => { state.systemMetrics.loading = false; state.systemMetrics.error = action.error.message; });

    // NEW: System Errors
    builder.addCase(fetchSystemErrors.pending, (state) => { state.systemErrors.loading = true; }).addCase(fetchSystemErrors.fulfilled, (state, action) => { state.systemErrors.loading = false; state.systemErrors.data = action.payload; }).addCase(fetchSystemErrors.rejected, (state, action) => { state.systemErrors.loading = false; });

    // NEW: Activity Stats
    builder.addCase(fetchActivityStats.pending, (state) => { state.activityStats.loading = true; }).addCase(fetchActivityStats.fulfilled, (state, action) => { state.activityStats.loading = false; state.activityStats.data = action.payload; }).addCase(fetchActivityStats.rejected, (state, action) => { state.activityStats.loading = false; });

    // NEW: Backups
    builder.addCase(fetchBackups.pending, (state) => { state.backups.loading = true; }).addCase(fetchBackups.fulfilled, (state, action) => { state.backups.loading = false; state.backups.items = action.payload.items; state.backups.pagination = action.payload.pagination; }).addCase(fetchBackups.rejected, (state, action) => { state.backups.loading = false; state.backups.error = action.error.message; });

    // NEW: Create Backup
    builder.addCase(createBackup.pending, (state) => { state.backups.loading = true; }).addCase(createBackup.fulfilled, (state, action) => { state.backups.loading = false; if (action.payload) { state.backups.items.unshift(action.payload); state.backups.pagination.total += 1; } }).addCase(createBackup.rejected, (state, action) => { state.backups.loading = false; state.backups.error = action.error.message; });

    // NEW: Restore Backup
    builder.addCase(restoreBackup.pending, (state) => { state.backups.loading = true; }).addCase(restoreBackup.fulfilled, (state) => { state.backups.loading = false; }).addCase(restoreBackup.rejected, (state, action) => { state.backups.loading = false; state.backups.error = action.error.message; });

    // NEW: Delete Backup
    builder.addCase(deleteBackup.pending, (state) => { state.backups.loading = true; }).addCase(deleteBackup.fulfilled, (state, action) => {
      state.backups.loading = false;
      const id = action.payload?.id || action.meta.arg;
      state.backups.items = state.backups.items.filter((b) => String(b._id) !== String(id));
      state.backups.pagination.total = Math.max(0, (state.backups.pagination.total || 0) - 1);
    }).addCase(deleteBackup.rejected, (state, action) => { state.backups.loading = false; state.backups.error = action.error.message; });
  },
});
export default adminSlice.reducer;
