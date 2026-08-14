import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bus, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
    createAdminBus,
    deleteAdminBus,
    fetchAdminBuses,
    updateAdminBus,
} from "../../../AllStatesFeatures/Admin/AdminSlice";
import {
    AdminDataTable,
    ConfirmDialog,
    DataToolbar,
    EmptyState,
    Pagination,
    Skeleton,
    StationMap,
} from "./AdminShared";

const TYPES = ["Sleeper", "Semi Sleeper", "Seater", "Luxury", "AC"];

const blank = {
    busNumber: "",
    company: "",
    operator: "",
    routeText: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    type: "Seater",
    status: "Active",
    baseFarePerKm: 1,
    seats: [],
    driverLocation: { latitude: "", longitude: "" },
};

const generateSeats = (count, type) =>
    Array.from({ length: count }, (_, index) => ({
        seatNumber: index + 1,
        seatType: type,
        status: "Available",
        position: index,
    }));

function BusSeatEditor({ seats = [], type, onChange }) {
    const [count, setCount] = useState(0);
    const [dragged, setDragged] = useState(null);

    // Safely ensure seats is an array with proper status
    const safeSeats = Array.isArray(seats)
        ? seats.map((seat, idx) => ({
            seatNumber: seat?.seatNumber || idx + 1,
            seatType: seat?.seatType || type,
            status: seat?.status || "Available",
            position: seat?.position ?? idx,
        }))
        : [];

    const orderedSeats = [...safeSeats].sort((a, b) => a.position - b.position);

    const swap = (target) => {
        if (dragged === null || dragged === target) return;
        const next = [...orderedSeats];
        [next[dragged], next[target]] = [next[target], next[dragged]];
        onChange(next.map((seat, index) => ({ ...seat, position: index })));
        setDragged(null);
    };

    return (
        <section className="seat-editor">
            <div className="seat-editor-head">
                <div>
                    <h3>Seat editor</h3>
                    <p>
                        Drag a seat to rearrange its visual order. Click a seat to toggle
                        its booking status.
                    </p>
                </div>
                <div className="seat-generator">
                    <input
                        min="1"
                        type="number"
                        value={count}
                        onChange={(event) => setCount(Number(event.target.value))}
                        placeholder="Seats"
                    />
                    <button
                        type="button"
                        className="admin-secondary"
                        onClick={() => onChange(generateSeats(count, type))}
                    >
                        Auto generate
                    </button>
                </div>
            </div>
            {safeSeats.length ? (
                <div className="bus-seat-grid">
                    {orderedSeats.map((seat, index) => (
                        <button
                            draggable
                            type="button"
                            key={`${seat.seatNumber}-${index}`}
                            className={`bus-seat ${(seat.status || "Available").toLowerCase()}`}
                            onDragStart={() => setDragged(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => swap(index)}
                            onClick={() =>
                                onChange(
                                    safeSeats.map((item) =>
                                        item.seatNumber === seat.seatNumber
                                            ? {
                                                ...item,
                                                status:
                                                    item.status === "Available"
                                                        ? "Blocked"
                                                        : "Available",
                                            }
                                            : item
                                    )
                                )
                            }
                        >
                            <b>{seat.seatNumber}</b>
                            <small>{seat.status || "Available"}</small>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="seat-empty">
                    Set a seat count and automatically generate the layout.
                </p>
            )}
        </section>
    );
}

function BusForm({ bus, onClose }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState(
        bus
            ? {
                ...bus,
                routeText: Array.isArray(bus.route) ? bus.route.join(", ") : "",
                driverLocation: bus.driverLocation || {
                    latitude: "",
                    longitude: "",
                },
            }
            : blank
    );
    const [saving, setSaving] = useState(false);

    const set = (key, value) =>
        setForm((state) => ({ ...state, [key]: value }));

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        const route = form.routeText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        const payload = {
            ...form,
            route,
            stationMap: Object.fromEntries(
                route.map((stop, index) => [
                    stop,
                    { distance: index * 50, duration: `${index}h` },
                ])
            ),
        };

        const result = await dispatch(
            bus
                ? updateAdminBus({ id: bus._id, payload })
                : createAdminBus(payload)
        );
        setSaving(false);

        if (result.meta.requestStatus === "fulfilled") {
            toast.success(`Bus ${bus ? "updated" : "created"}`);
            onClose();
        } else {
            toast.error(result.error?.message || "Unable to save bus");
        }
    };

    return (
        <div className="admin-dialog-backdrop">
            <section className="flight-form-modal">
                <header>
                    <div>
                        <p>Road operations</p>
                        <h2>{bus ? "Edit bus" : "Create bus"}</h2>
                    </div>
                    <button className="admin-secondary" onClick={onClose}>
                        Close
                    </button>
                </header>
                <form onSubmit={save}>
                    <div className="flight-form-grid">
                        <label>
                            Bus number
                            <input
                                required
                                value={form.busNumber}
                                onChange={(event) => set("busNumber", event.target.value)}
                            />
                        </label>
                        <label>
                            Operator
                            <input
                                required
                                value={form.company}
                                onChange={(event) => {
                                    set("company", event.target.value);
                                    if (!form.operator) set("operator", event.target.value);
                                }}
                            />
                        </label>
                        <label>
                            Operator display name
                            <input
                                value={form.operator}
                                onChange={(event) => set("operator", event.target.value)}
                            />
                        </label>
                        <label>
                            Bus type
                            <select
                                value={form.type}
                                onChange={(event) => set("type", event.target.value)}
                            >
                                {TYPES.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Departure
                            <input
                                required
                                type="time"
                                value={form.departureTime}
                                onChange={(event) =>
                                    set("departureTime", event.target.value)
                                }
                                aria-label="Departure time"
                            />
                        </label>
                        <label>
                            Arrival
                            <input
                                required
                                type="time"
                                value={form.arrivalTime}
                                onChange={(event) => set("arrivalTime", event.target.value)}
                                aria-label="Arrival time"
                            />
                        </label>
                        <label>
                            Duration
                            <div className="duration-inputs">
                                <input
                                    min="0"
                                    type="number"
                                    value={form.durationHours || 0}
                                    onChange={(event) => set("durationHours", Number(event.target.value))}
                                    aria-label="Duration hours"
                                />
                                <input
                                    min="0"
                                    max="59"
                                    type="number"
                                    value={form.durationMinutes || 0}
                                    onChange={(event) => set("durationMinutes", Number(event.target.value))}
                                    aria-label="Duration minutes"
                                />
                            </div>
                        </label>
                        <label>
                            Route (comma-separated stops)
                            <textarea
                                required
                                value={form.routeText}
                                onChange={(event) => set("routeText", event.target.value)}
                                rows={3}
                                aria-label="Route stops"
                            />
                        </label>
                        {form.routeText && (
                            <div className="route-visual">
                                <strong>Route:</strong>
                                <br />
                                <StationMap stations={form.routeText.split(",").map((s) => s.trim()).filter(Boolean)} />
                            </div>
                        )}
                        <label>
                            Base fare per KM
                            <input
                                required
                                type="number"
                                value={form.baseFarePerKm}
                                onChange={(event) =>
                                    set("baseFarePerKm", parseFloat(event.target.value))
                                }
                            />
                        </label>
                        <label>
                            Status
                            <select
                                value={form.status}
                                onChange={(event) => set("status", event.target.value)}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </label>
                    </div>

                    <BusSeatEditor
                        seats={form.seats || []}
                        type={form.type}
                        onChange={(seats) => set("seats", seats)}
                    />

                    <div className="flight-form-buttons">
                        <button type="button" className="admin-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save bus"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function AdminBuses() {
    const dispatch = useDispatch();
    const state = useSelector((state) => state.admin?.buses || {});
    const { items = [], pagination = {}, loading = false } = state;
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        order: "desc",
        status: "",
    });
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminBuses(filters));
    }, [dispatch, filters]);

    const update = (next) =>
        setFilters((current) => ({ ...current, ...next }));

    const remove = async () => {
        const result = await dispatch(deleteAdminBus(deleting._id));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Bus deleted");
        } else {
            toast.error(result.error?.message || "Unable to delete bus");
        }
        setDeleting(null);
    };

    const columns = [
        { key: "bus", label: "Bus" },
        { key: "route", label: "Route & stops" },
        { key: "schedule", label: "Schedule" },
        { key: "seats", label: "Seats" },
        { key: "driver", label: "Driver location" },
        { key: "status", label: "Status" },
        { key: "actions", label: "" },
    ];

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Road inventory</p>
                    <h1>Buses</h1>
                </div>
                <button className="admin-primary" onClick={() => setEditing({})}>
                    <Plus size={15} /> Add bus
                </button>
            </div>

            <DataToolbar filters={filters} onChange={update} statuses={false} />

            <div className="flight-filter">
                <select
                    value={filters.status}
                    onChange={(event) =>
                        update({ status: event.target.value, page: 1 })
                    }
                >
                    <option value="">All bus statuses</option>
                    {["Active", "Inactive", "Cancelled"].map((item) => (
                        <option key={item}>{item}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <Skeleton />
            ) : (
                <AdminDataTable
                    columns={columns}
                    rows={items}
                    rowKey="_id"
                    renderCell={(bus, key) => {
                        if (key === "bus")
                            return (
                                <>
                                    <b>{bus.busNumber}</b>
                                    <small>
                                        {bus.operator || bus.company} · {bus.type}
                                    </small>
                                </>
                            );
                        if (key === "route")
                            return Array.isArray(bus.route)
                                ? bus.route.join(" → ")
                                : "N/A";
                        if (key === "schedule")
                            return (
                                <>
                                    <b>
                                        {bus.departureTime} – {bus.arrivalTime}
                                    </b>
                                    <small>{bus.duration}</small>
                                </>
                            );
                        if (key === "seats")
                            return `${bus.seats?.length || 0} seats · ${bus.seats?.filter((s) => s.status === "Available").length || 0
                                } available`;
                        if (key === "driver")
                            return bus.driverLocation
                                ? `${bus.driverLocation.latitude}, ${bus.driverLocation.longitude}`
                                : "Not set";
                        if (key === "status")
                            return (
                                <span
                                    className={`status-badge status-${bus.status?.toLowerCase()}`}
                                >
                                    {bus.status}
                                </span>
                            );
                        if (key === "actions")
                            return (
                                <div className="table-actions">
                                    <button
                                        type="button"
                                        className="action-btn action-edit"
                                        onClick={() => setEditing(bus)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="action-btn action-delete"
                                        onClick={() => setDeleting(bus)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        return null;
                    }}
                    onRowClick={(bus) => setEditing(bus)}
                />
            )}

            {editing && (
                <BusForm
                    bus={editing && Object.keys(editing).length > 0 ? editing : null}
                    onClose={() => setEditing(null)}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title="Delete Bus"
                    message={`Are you sure you want to delete bus ${deleting.busNumber}?`}
                    onConfirm={remove}
                    onCancel={() => setDeleting(null)}
                />
            )}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={Bus}
                    title="No buses found"
                    message="Create your first bus to get started"
                    action={() => setEditing({})}
                />
            )}
        </>
    );
}
