import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { deleteAdminHotel, fetchAdminHotelBookings, fetchAdminHotels } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { AdminDataTable, ConfirmDialog, DataToolbar, EmptyState, Pagination, Skeleton } from "./AdminShared";

const blankHotel = {
    name: "",
    city: "",
    address: "",
    description: "",
    starRating: 3,
    pricePerNight: 0,
    availableRooms: 1,
    amenitiesText: "",
    isActive: true,
};

export default function AdminHotels() {
    const dispatch = useDispatch();
    const state = useSelector((state) => state.admin.hotels || {});
    const hotelBookingState = useSelector((state) => state.admin.hotelBookings || {});
    const { items = [], pagination = {}, loading = false } = state;
    const { items: hotelBookings = [], pagination: hotelBookingsPagination = {}, loading: hotelBookingsLoading = false } = hotelBookingState;
    const [filters, setFilters] = useState({ page: 1, limit: 10, order: "desc", status: "", search: "" });
    const [bookingFilters, setBookingFilters] = useState({ page: 1, limit: 10, order: "desc", status: "", search: "" });
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(blankHotel);
    const [showForm, setShowForm] = useState(false);
    const [targetDelete, setTargetDelete] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [selectedHotelForBookings, setSelectedHotelForBookings] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminHotels(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        if (!selectedHotelForBookings) return;
        dispatch(fetchAdminHotelBookings({ hotelId: selectedHotelForBookings._id, params: bookingFilters }));
    }, [dispatch, selectedHotelForBookings?._id, bookingFilters]);

    const updateFilters = (next) => setFilters((current) => ({ ...current, ...next }));
    const updateBookingFilters = (next) => setBookingFilters((current) => ({ ...current, ...next }));

    const openBookings = (hotel) => {
        setSelectedHotelForBookings(hotel);
        setBookingFilters({ page: 1, limit: 10, order: "desc", status: "", search: "" });
    };

    const closeBookings = () => {
        setSelectedHotelForBookings(null);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(blankHotel);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setShowForm(true);
    };

    const openEdit = (hotel) => {
        setEditing(hotel);
        setForm({
            ...hotel,
            amenitiesText: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : "",
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setShowForm(true);
    };

    const handleFileSelection = (event) => {
        const files = Array.from(event.target.files || []);
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setSelectedFiles(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    };

    const saveHotel = async (event) => {
        event.preventDefault();
        const payload = {
            name: form.name,
            city: form.city,
            address: form.address,
            description: form.description,
            starRating: Number(form.starRating) || 0,
            pricePerNight: Number(form.pricePerNight) || 0,
            availableRooms: Number(form.availableRooms) || 0,
            amenities: String(form.amenitiesText || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            isActive: Boolean(form.isActive),
        };

        try {
            let response;
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    if (value === undefined || value === null) return;
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key, item));
                    } else {
                        formData.append(key, value);
                    }
                });
                selectedFiles.forEach((file) => formData.append("images", file));
                response = editing
                    ? await axios.patch(`/admin/hotels/${editing._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
                    : await axios.post("/admin/hotels", formData, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                response = editing
                    ? await axios.patch(`/admin/hotels/${editing._id}`, payload)
                    : await axios.post("/admin/hotels", payload);
            }

            if (response?.status >= 200 && response?.status < 300) {
                toast.success(editing ? "Hotel updated" : "Hotel created");
                setShowForm(false);
                setEditing(null);
                setSelectedFiles([]);
                setPreviewUrls([]);
                dispatch(fetchAdminHotels(filters));
            } else {
                toast.error(response?.data?.message || "Unable to save hotel");
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || err?.message || "Unable to save hotel");
        }
    };

    const confirmDelete = async () => {
        if (!targetDelete) return;
        const result = await dispatch(deleteAdminHotel(targetDelete._id));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Hotel deleted");
            dispatch(fetchAdminHotels(filters));
            if (selectedHotelForBookings && selectedHotelForBookings._id === targetDelete._id) {
                setSelectedHotelForBookings(null);
            }
        } else {
            toast.error(result.error?.message || "Unable to delete hotel");
        }
        setTargetDelete(null);
    };

    const columns = [
        { key: "name", label: "Hotel" },
        { key: "city", label: "City" },
        { key: "rooms", label: "Rooms" },
        { key: "rating", label: "Rating" },
        { key: "price", label: "Price" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Hospitality inventory</p>
                    <h1>Hotels</h1>
                </div>
                <div>
                    <button className="admin-primary" type="button" onClick={openCreate}>
                        <Plus size={14} /> Add hotel
                    </button>
                </div>
            </div>

            <DataToolbar filters={filters} onChange={updateFilters} statuses={true} />

            {loading ? (
                <Skeleton />
            ) : (
                <AdminDataTable
                    columns={columns}
                    rows={items}
                    rowKey="_id"
                    renderCell={(hotel, key) => {
                        const availableRooms = Number(hotel.availableRooms);
                        const ratingValue = Number(hotel.starRating);
                        const priceValue = Number(hotel.pricePerNight);

                        if (key === "name") return <b>{hotel.name}</b>;
                        if (key === "city") return hotel.city || "—";
                        if (key === "rooms") return `${Number.isFinite(availableRooms) ? availableRooms : 0} available`;
                        if (key === "rating") return `${Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : "0.0"} ★`;
                        if (key === "price") return `₹${Number.isFinite(priceValue) ? priceValue.toFixed(0) : 0}/night`;
                        if (key === "status") return hotel.isActive ? <span className="status-badge status-active">Active</span> : <span className="status-badge status-inactive">Inactive</span>;
                        if (key === "actions")
                            return (
                                <div className="table-actions">
                                    <button type="button" className="action-btn action-primary" onClick={() => openBookings(hotel)}>
                                        Bookings
                                    </button>
                                    <button type="button" className="action-btn action-edit" onClick={() => openEdit(hotel)}>
                                        Edit
                                    </button>
                                    <button type="button" className="action-btn action-delete" onClick={() => setTargetDelete(hotel)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        return null;
                    }}
                >
                    <EmptyState title="No hotels yet" description="Add hotel inventory to start managing accommodations." />
                </AdminDataTable>
            )}

            <Pagination pagination={pagination} onPage={(page) => updateFilters({ page })} />

            {selectedHotelForBookings && (
                <section className="admin-table-card admin-bookings-panel">
                    <div className="admin-page-heading">
                        <div>
                            <p>Hotel bookings</p>
                            <h2>{selectedHotelForBookings.name}</h2>
                        </div>
                        <div>
                            <button className="admin-secondary" type="button" onClick={closeBookings}>
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="admin-toolbar">
                        <label className="admin-search">
                            <input
                                aria-label="Search hotel bookings"
                                value={bookingFilters.search}
                                placeholder="Search bookings…"
                                onChange={(event) => updateBookingFilters({ search: event.target.value, page: 1 })}
                            />
                        </label>
                        <select value={bookingFilters.status || ""} onChange={(event) => updateBookingFilters({ status: event.target.value, page: 1 })}>
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select value={bookingFilters.order || "desc"} onChange={(event) => updateBookingFilters({ order: event.target.value, page: 1 })}>
                            <option value="desc">Newest first</option>
                            <option value="asc">Oldest first</option>
                        </select>
                    </div>

                    {hotelBookingsLoading ? (
                        <Skeleton rows={3} />
                    ) : hotelBookings.length ? (
                        <AdminDataTable
                            columns={[
                                { key: "customer", label: "Customer" },
                                { key: "status", label: "Status" },
                                { key: "roomType", label: "Room type" },
                                { key: "dates", label: "Dates" },
                                { key: "rooms", label: "Rooms" },
                                { key: "amount", label: "Amount" },
                            ]}
                            rows={hotelBookings}
                            rowKey="id"
                            renderCell={(booking, key) => {
                                if (key === "customer") return booking.customer;
                                if (key === "status") return <span className={`status-badge ${booking.status === "confirmed" ? "status-active" : "status-inactive"}`}>{booking.status}</span>;
                                if (key === "roomType") return booking.roomType || "—";
                                if (key === "dates") return `${new Date(booking.checkIn).toLocaleDateString()} → ${new Date(booking.checkOut).toLocaleDateString()}`;
                                if (key === "rooms") return `${booking.rooms} room${booking.rooms === 1 ? "" : "s"}`;
                                if (key === "amount") return `₹${Number.isFinite(Number(booking.amount)) ? Number(booking.amount).toLocaleString() : 0}`;
                                return null;
                            }}
                        >
                            <EmptyState title="No bookings found" description="This hotel has no bookings yet." />
                        </AdminDataTable>
                    ) : (
                        <EmptyState title="No bookings found" description="This hotel has no bookings yet." />
                    )}

                    <Pagination pagination={hotelBookingsPagination} onPage={(page) => updateBookingFilters({ page })} />
                </section>
            )}

            <ConfirmDialog
                open={!!targetDelete}
                title="Delete hotel"
                message={`Delete ${targetDelete?.name || "this hotel"}?`}
                onConfirm={confirmDelete}
                onCancel={() => setTargetDelete(null)}
                confirmText="Delete"
            />

            {showForm && (
                <div className="admin-dialog-backdrop">
                    <section className="flight-form-modal">
                        <header>
                            <div>
                                <p>Hotel management</p>
                                <h2>{editing ? "Edit hotel" : "Create hotel"}</h2>
                            </div>
                            <div>
                                <button className="admin-secondary" type="button" onClick={() => setShowForm(false)}>
                                    Close
                                </button>
                            </div>
                        </header>
                        <form onSubmit={saveHotel}>
                            <div className="flight-form-grid">
                                <label>
                                    Hotel name
                                    <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} aria-label="Hotel name" />
                                </label>
                                <label>
                                    City
                                    <input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} aria-label="City" />
                                </label>
                                <label>
                                    Address
                                    <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} aria-label="Address" />
                                </label>
                                <label>
                                    Description
                                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
                                </label>
                                <label>
                                    Star rating
                                    <input type="number" min="0" max="5" step="0.1" value={form.starRating} onChange={(event) => setForm({ ...form, starRating: Number(event.target.value) })} aria-label="Star rating" />
                                </label>
                                <label>
                                    Price per night
                                    <input type="number" min="0" value={form.pricePerNight} onChange={(event) => setForm({ ...form, pricePerNight: Number(event.target.value) })} aria-label="Price per night" />
                                </label>
                                <label>
                                    Available rooms
                                    <input type="number" min="0" value={form.availableRooms} onChange={(event) => setForm({ ...form, availableRooms: Number(event.target.value) })} aria-label="Available rooms" />
                                </label>
                                <label>
                                    Amenities (comma separated)
                                    <input value={form.amenitiesText} onChange={(event) => setForm({ ...form, amenitiesText: event.target.value })} aria-label="Amenities" />
                                </label>
                                <label>
                                    Upload images
                                    <input type="file" multiple accept="image/*" onChange={handleFileSelection} aria-label="Upload images" />
                                </label>
                                <label>
                                    Upload images
                                    <input type="file" multiple accept="image/*" onChange={handleFileSelection} aria-label="Upload images" />
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div className="field-hint" aria-live="polite">
                                        <strong>Selected images:</strong>
                                        <ul>
                                            {selectedFiles.map((file) => (
                                                <li key={file.name}>{file.name}</li>
                                            ))}
                                        </ul>
                                        <div className="image-preview-list">
                                            {previewUrls.map((url) => (
                                                <img key={url} src={url} alt="Preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, marginRight: 8 }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <label className="checkbox-field">
                                    <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} aria-label="Active" />
                                    Active
                                </label>
                            </div>
                            <footer>
                                <button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-primary">
                                    {editing ? "Update hotel" : "Create hotel"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
