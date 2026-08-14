import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { createAdminAnnouncement } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const buildApiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export default function AdminAnnouncements() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({ title: "", message: "", userIds: "" });
    const [saving, setSaving] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchDebounceRef = useRef(null);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();

        if (!form.title.trim() || !form.message.trim()) {
            toast.error("Title and message are required for announcements.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            message: form.message.trim(),
            userIds: selectedUsers.map((u) => u._id),
        };

        setSaving(true);
        const result = await dispatch(createAdminAnnouncement(payload));
        setSaving(false);

        if (createAdminAnnouncement.fulfilled.match(result)) {
            toast.success("Announcement sent successfully.");
            setForm({ title: "", message: "", userIds: "" });
            setSelectedUsers([]);
            setSearchTerm("");
            await fetchAnnouncements(1);
        } else {
            toast.error(result.error?.message || "Failed to send announcement.");
        }
    };

    const runUserSearch = async (term) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            setSearching(true);
            const res = await axios.get(buildApiUrl(`/admin/users?query=${encodeURIComponent(term)}&limit=10`));
            const items = res.data?.items || res.data?.data?.items || res.data || [];
            const users = Array.isArray(items) ? items : (items.items || []);
            setSearchResults(users.filter((u) => !selectedUsers.find((s) => s._id === u._id)));
        } catch (err) {
            console.error('User search failed', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => runUserSearch(searchTerm), 300);
        return () => clearTimeout(searchDebounceRef.current);
    }, [searchTerm]);

    const addUser = (user) => { setSelectedUsers((s) => [...s, user]); setSearchTerm(""); setSearchResults([]); };
    const removeUser = (id) => { setSelectedUsers((s) => s.filter((u) => u._id !== id)); };

    const fetchAnnouncements = async (p = 1) => {
        try {
            setLoading(true);
            const res = await axios.get(buildApiUrl(`/notifications/admin/announcements?page=${p}&limit=20`));
            setAnnouncements(res.data.data || []);
            setPage(res.data.pagination?.page || 1);
            setPages(res.data.pagination?.pages || 1);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load announcement history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(1); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await axios.delete(buildApiUrl(`/notifications/admin/announcements/${id}`));
            toast.success('Announcement deleted');
            fetchAnnouncements(page);
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete announcement');
        }
    };

    return (
        <div>
            <div className="admin-page-heading">
                <div>
                    <p>Platform communication</p>
                    <h1>Announcements</h1>
                </div>
            </div>

            <div className="admin-card p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Title</label>
                        <input
                            value={form.title}
                            onChange={(event) => updateField("title", event.target.value)}
                            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none"
                            placeholder="Announcement title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700">Message</label>
                        <textarea
                            value={form.message}
                            onChange={(event) => updateField("message", event.target.value)}
                            className="mt-2 h-36 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none"
                            placeholder="Write your announcement message here..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700">Target users (optional)</label>
                        <div className="mt-2 relative">
                            <div className="flex flex-wrap gap-2 p-2 border rounded-xl bg-white">
                                {selectedUsers.map((u) => (
                                    <div key={u._id} className="px-3 py-1 rounded-full bg-stone-100 text-sm flex items-center gap-2">
                                        <span>{u.name || u.email}</span>
                                        <button type="button" onClick={() => removeUser(u._id)} className="text-xs text-stone-500">✕</button>
                                    </div>
                                ))}
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-grow min-w-[160px] border-none outline-none px-2 py-1"
                                    placeholder="Search users by name or email..."
                                />
                            </div>

                            {searching && <div className="mt-1 text-sm text-stone-500">Searching…</div>}
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-56 overflow-auto">
                                    {searchResults.map((u) => (
                                        <div key={u._id} onClick={() => addUser(u)} className="p-2 hover:bg-stone-50 cursor-pointer">
                                            <div className="text-sm font-medium">{u.name || u.email}</div>
                                            <div className="text-xs text-stone-500">{u.email}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                        <p className="mt-2 text-xs text-stone-500">Leave empty to broadcast to every active user. Select users to target specific recipients.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Sending announcement…" : "Send announcement"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setForm({ title: "", message: "", userIds: "" }); setSelectedUsers([]); setSearchTerm(""); }}
                            className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm text-stone-700 transition hover:bg-stone-50"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            <div className="admin-page-heading mt-8">
                <div>
                    <p>Admin</p>
                    <h2>Announcement history</h2>
                </div>
            </div>

            <div className="admin-card p-6 mt-4">
                {loading ? (
                    <p>Loading announcements…</p>
                ) : announcements.length === 0 ? (
                    <p className="text-sm text-stone-500">No announcements yet.</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((a) => (
                            <div key={a._id} className="p-4 border rounded-lg bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{a.title}</h3>
                                        <p className="text-xs text-stone-500">{new Date(a.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDelete(a._id)} className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm text-red-700">Delete</button>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-stone-700">{a.message}</p>
                            </div>
                        ))}

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-stone-500">Page {page} of {pages}</div>
                            <div className="flex gap-2">
                                <button disabled={page <= 1} onClick={() => fetchAnnouncements(page - 1)} className="px-3 py-1 rounded border">Prev</button>
                                <button disabled={page >= pages} onClick={() => fetchAnnouncements(page + 1)} className="px-3 py-1 rounded border">Next</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
