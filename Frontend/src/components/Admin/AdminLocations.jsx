import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Edit } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchAdminLocations, deleteAdminLocation } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { ConfirmDialog, DataToolbar, EmptyState, Pagination, Skeleton, AdminDataTable } from "./AdminShared";

export default function AdminLocations() {
    const dispatch = useDispatch();
    const state = useSelector((s) => s.admin.locations);
    const { items = [], loading, pagination = {} } = state || {};
    const [filters, setFilters] = useState({ page: 1, limit: 10, order: "desc", search: "" });
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", latitude: "", longitude: "", category: "Other", tags: "", imagesText: "", isPopular: false });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [targetDelete, setTargetDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminLocations(filters));
    }, [dispatch, filters]);

    const updateFilters = (next) => setFilters((cur) => ({ ...cur, ...next }));

    const openCreate = () => { setEditing(null); setForm({ name: "", description: "", latitude: "", longitude: "", category: "Other", tags: "", imagesText: "", isPopular: false }); setSelectedFiles([]); setShowForm(true); };
    const openEdit = (loc) => { setEditing(loc); setForm({ name: loc.name || "", description: loc.description || "", latitude: loc.latitude ?? "", longitude: loc.longitude ?? "", category: loc.category || "Other", tags: (loc.tags || []).join(", "), imagesText: (loc.images || []).join(", "), isPopular: !!loc.isPopular }); setSelectedFiles([]); setShowForm(true); };

    const save = async (e) => {
        e.preventDefault();
        if (!form.name || !form.name.trim()) return toast.error("Name is required");

        const payload = {
            name: form.name,
            description: form.description,
            latitude: form.latitude,
            longitude: form.longitude,
            category: form.category,
            tags: form.tags,
            isPopular: !!form.isPopular,
        };

        try {
            let res;
            if (selectedFiles && selectedFiles.length > 0) {
                const fd = new FormData();
                Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
                selectedFiles.forEach((file) => fd.append("images", file));
                if (editing) res = await axios.patch(`/admin/locations/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                else res = await axios.post(`/admin/locations`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                // include imagesText and tags as arrays
                payload.tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
                payload.images = form.imagesText ? form.imagesText.split(",").map((u) => u.trim()).filter(Boolean) : [];
                if (editing) res = await axios.patch(`/admin/locations/${editing._id}`, payload);
                else res = await axios.post(`/admin/locations`, payload);
            }
            toast.success(editing ? "Location updated" : "Location created");
            setShowForm(false);
            setSelectedFiles([]);
            dispatch(fetchAdminLocations(filters));
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Unable to save location");
        }
    };

    const confirmDelete = async () => {
        if (!targetDelete) return;
        await dispatch(deleteAdminLocation(targetDelete._id));
        setTargetDelete(null);
        dispatch(fetchAdminLocations(filters));
    };

    const columns = [
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "country", label: "Country" },
        { key: "actions", label: "Actions" },
    ];

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Content</p>
                    <h1>Locations</h1>
                </div>
                <div>
                    <button className="admin-secondary" onClick={openCreate}><Plus size={14} /> Create location</button>
                </div>
            </div>

            <DataToolbar filters={filters} onChange={updateFilters} statuses={false} />

            {loading ? <Skeleton /> : (
                <AdminDataTable columns={columns} rows={items} rowKey="_id" renderCell={(loc, key) => {
                    if (key === "name") return <b>{loc.name}</b>;
                    if (key === "slug") return loc.slug || "—";
                    if (key === "country") return loc.country || "—";
                    if (key === "actions") return <div><button className="admin-secondary mr-2" onClick={() => openEdit(loc)}><Edit size={14} /></button><button className="admin-danger" onClick={() => setTargetDelete(loc)}><Trash2 size={14} /></button></div>;
                    return null;
                }}>
                    <EmptyState title="No locations" description="Add a new location to get started." />
                </AdminDataTable>
            )}

            <Pagination pagination={pagination} onPage={(page) => updateFilters({ page })} />

            <ConfirmDialog open={!!targetDelete} title="Delete location" message={`Delete ${targetDelete?.name || "this location"}?`} onConfirm={confirmDelete} onCancel={() => setTargetDelete(null)} confirmText="Delete" />

            {showForm && (
                <div className="admin-dialog-backdrop">
                    <section className="flight-form-modal">
                        <header>
                            <div>
                                <p>Location management</p>
                                <h2>{editing ? "Edit location" : "Create location"}</h2>
                            </div>
                            <div>
                                <button className="admin-secondary" onClick={() => setShowForm(false)}>Close</button>
                            </div>
                        </header>
                        <form onSubmit={save}>
                            <div className="flight-form-grid">
                                <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Location name" /></label>
                                <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Location description" /></label>
                                <label>Latitude<input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} aria-label="Latitude" placeholder="e.g. 12.9716" /></label>
                                <label>Longitude<input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} aria-label="Longitude" placeholder="e.g. 77.5946" /></label>
                                <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option>Beach</option>
                                    <option>Mountain</option>
                                    <option>City</option>
                                    <option>Heritage</option>
                                    <option>Adventure</option>
                                    <option>Cultural</option>
                                    <option>Nature</option>
                                    <option>Other</option>
                                </select></label>
                                <label>Tags (comma separated)<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
                                <label>Images (URLs)<input value={form.imagesText} onChange={(e) => setForm({ ...form, imagesText: e.target.value })} placeholder="Comma separated URLs" aria-label="Images URLs" /></label>
                                <label>Upload images<input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} aria-label="Upload images" /></label>
                                <label className=""> <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Mark as popular</label>
                            </div>
                            <footer>
                                <button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="admin-primary">{editing ? "Update" : "Create"}</button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
