import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Train, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { createAdminTrain, deleteAdminTrain, fetchAdminTrains, updateAdminTrain } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { AdminDataTable, ConfirmDialog, DataToolbar, EmptyState, Pagination, Skeleton, StationMap } from "./AdminShared";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = ["General", "Sleeper", "3AC", "2AC", "1AC", "Chair Car"];
const blank = { trainNumber: "", trainName: "", trainType: "Express", journeyHours: 0, journeyMinutes: 0, routeText: "", departureTime: "", arrivalTime: "", days: DAYS, status: "Active", coaches: [] };

const seatsFor = (capacity, type) =>
    Array.from({ length: capacity }, (_, index) => ({
        seatNumber: index + 1,
        seatClass: type,
        seatType: index % 6 === 0 || index % 6 === 5 ? "Window" : index % 3 === 1 ? "Middle" : "Aisle",
        status: "Available",
    }));

function CoachEditor({ coaches, onChange }) {
    const add = () =>
        onChange([
            ...coaches,
            { coachType: "Sleeper", coachCode: `S${coaches.length + 1}`, capacity: 0, baseFarePerKm: 1, waitingListCapacity: 0, racCapacity: 0, seats: [] },
        ]);

    const update = (index, changes) => onChange(coaches.map((coach, current) => (current === index ? { ...coach, ...changes } : coach)));
    const remove = (index) => onChange(coaches.filter((_, current) => current !== index));
    const generateSeats = (index) => {
        const capacity = Math.min(500, Math.max(1, Number(coaches[index].capacity) || 0));
        update(index, { capacity, seats: seatsFor(capacity, coaches[index].coachType) });
    };
    const toggleSeat = (coachIndex, seatIndex) => {
        const coach = coaches[coachIndex];
        const seats = coach.seats.map((seat, current) => current === seatIndex
            ? { ...seat, status: seat.status === "Blocked" ? "Available" : "Blocked", isBooked: false }
            : seat);
        update(coachIndex, { seats });
    };

    return (
        <section className="seat-editor">
            <div className="seat-editor-head">
                <div>
                    <h3>Coach management</h3>
                    <p>Generate seats, then click a seat to toggle Available and Blocked.</p>
                </div>
                <button type="button" className="admin-secondary" onClick={add}>
                    Add coach
                </button>
            </div>

            {coaches.map((coach, index) => (
                <div className="train-coach" key={`${coach.coachCode}-${index}`}>
                    <div className="train-coach-grid">
                        <label>
                            Coach type
                            <select value={coach.coachType} onChange={(event) => update(index, { coachType: event.target.value })}>
                                {TYPES.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Code
                            <input value={coach.coachCode} onChange={(event) => update(index, { coachCode: event.target.value })} />
                        </label>

                        <label>
                            Seats
                            <input min="1" type="number" value={coach.capacity} onChange={(event) => update(index, { capacity: Number(event.target.value) })} />
                        </label>

                        <label>
                            Fare / km
                            <input min="0" type="number" value={coach.baseFarePerKm} onChange={(event) => update(index, { baseFarePerKm: Number(event.target.value) })} />
                        </label>

                        <label>
                            RAC capacity
                            <input min="0" type="number" value={coach.racCapacity} onChange={(event) => update(index, { racCapacity: Number(event.target.value) })} />
                        </label>

                        <label>
                            Waiting list
                            <input min="0" type="number" value={coach.waitingListCapacity} onChange={(event) => update(index, { waitingListCapacity: Number(event.target.value) })} />
                        </label>
                    </div>

                    <div className="coach-buttons">
                        <button type="button" className="admin-secondary" onClick={() => generateSeats(index)} disabled={!Number(coach.capacity)}>
                            Generate seats
                        </button>
                        <button type="button" className="admin-secondary" onClick={() => remove(index)}>
                            Remove coach
                        </button>
                    </div>
                    {coach.seats?.length > 0 && (
                        <div className="train-seat-editor" aria-label={`${coach.coachCode} seat layout`}>
                            <div className="train-seat-editor-head"><strong>{coach.coachCode} layout</strong><span>{coach.seats.length} seats · click a seat to block or restore it</span></div>
                            <div className="train-seat-grid">
                                {coach.seats.map((seat, seatIndex) => (
                                    <button
                                        type="button"
                                        key={seat.seatNumber}
                                        className={`train-seat ${String(seat.status || "Available").toLowerCase()}`}
                                        onClick={() => toggleSeat(index, seatIndex)}
                                        disabled={seat.status === "Booked"}
                                        title={seat.status === "Booked" ? "Booked seats cannot be changed" : `Set seat ${seat.seatNumber} ${seat.status === "Blocked" ? "available" : "blocked"}`}
                                    >
                                        <b>{seat.seatNumber}</b><small>{seat.status}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
}

function TrainForm({ train, onClose }) {
    const dispatch = useDispatch();
    const trainId = train?._id || train?.id;
    const isEdit = Boolean(trainId);
    const [form, setForm] = useState(isEdit ? { ...train, routeText: (train.route || []).join(", "), departureTime: train.departure?.time || train.departureTime || "", arrivalTime: train.arrival?.time || train.arrivalTime || "" } : blank);
    const [saving, setSaving] = useState(false);
    const set = (key, value) => setForm((state) => ({ ...state, [key]: value }));

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        const route = (form.routeText || "").split(",").map((item) => item.trim()).filter(Boolean);
        const journeyHours = Number(form.journeyHours || 0);
        const journeyMinutes = Number(form.journeyMinutes || 0);
        const journeyTime = `${journeyHours}h ${journeyMinutes}m`;

        const payload = {
            ...form,
            route,
            journeyTime,
            stationDistances: Object.fromEntries(route.map((station, index) => [station, index * 100])),
            departure: { station: route[0], time: form.departureTime || "00:00" },
            arrival: { station: route.at(-1), time: form.arrivalTime || "00:00" },
        };

        const result = await dispatch(isEdit ? updateAdminTrain({ id: trainId, payload }) : createAdminTrain(payload));
        setSaving(false);
        if (result.meta.requestStatus === "fulfilled") {
            toast.success(`Train ${isEdit ? "updated" : "created"}`);
            onClose();
        } else {
            toast.error(result.error?.message || "Unable to save train");
        }
    };

    return (
        <div className="admin-dialog-backdrop">
            <section className="flight-form-modal">
                <header>
                    <div>
                        <p>Rail operations</p>
                        <h2>{isEdit ? "Edit train" : "Create train"}</h2>
                    </div>
                    <button className="admin-secondary" onClick={onClose}>Close</button>
                </header>

                <form onSubmit={save}>
                    <div className="flight-form-grid">
                        <label>
                            Train number
                            <input required value={form.trainNumber} onChange={(event) => set("trainNumber", event.target.value)} />
                        </label>

                        <label>
                            Train name
                            <input required value={form.trainName} onChange={(event) => set("trainName", event.target.value)} />
                        </label>

                        <label>
                            Journey time
                            <div className="duration-inputs">
                                <input min="0" type="number" value={form.journeyHours || 0} onChange={(event) => set("journeyHours", Number(event.target.value))} aria-label="Journey hours" />
                                <input min="0" max="59" type="number" value={form.journeyMinutes || 0} onChange={(event) => set("journeyMinutes", Number(event.target.value))} aria-label="Journey minutes" />
                            </div>
                        </label>

                        <label>
                            Departure
                            <input type="time" value={form.departureTime || ""} onChange={(e) => set("departureTime", e.target.value)} aria-label="Departure time" />
                        </label>

                        <label>
                            Arrival
                            <input type="time" value={form.arrivalTime || ""} onChange={(e) => set("arrivalTime", e.target.value)} aria-label="Arrival time" />
                        </label>

                        <label>
                            Status
                            <select value={form.status} onChange={(event) => set("status", event.target.value)}>
                                {['Active', 'Inactive', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </label>

                        <label className="train-route">
                            Stations in order (comma separated)
                            <textarea required value={form.routeText} onChange={(event) => set("routeText", event.target.value)} rows={3} aria-label="Stations in order (comma separated)" />
                        </label>

                        {form.routeText && (
                            <div className="route-visual">
                                <strong>Route:</strong>
                                <StationMap stations={form.routeText.split(",").map((s) => s.trim()).filter(Boolean)} />
                            </div>
                        )}

                        <label>
                            Running days
                            <div className="running-days">
                                {DAYS.map((d) => (
                                    <label key={d} className="running-day">
                                        <input type="checkbox" checked={(form.days || []).includes(d)} onChange={(e) => {
                                            const next = new Set(form.days || []);
                                            if (e.target.checked) next.add(d); else next.delete(d);
                                            set("days", Array.from(next));
                                        }} /> {d.slice(0, 3)}
                                    </label>
                                ))}
                            </div>
                        </label>

                    </div>

                    <CoachEditor coaches={form.coaches || []} onChange={(coaches) => set("coaches", coaches)} />

                    <div className="flight-form-buttons">
                        <button type="button" className="admin-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="admin-primary" disabled={saving}>{saving ? 'Saving...' : 'Save train'}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function AdminTrains() {
    const dispatch = useDispatch();
    const { items = [], pagination = {}, loading = false } = useSelector((state) => state.admin.trains || {});
    const [filters, setFilters] = useState({ page: 1, limit: 10, order: "desc", status: "" });
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => { dispatch(fetchAdminTrains(filters)); }, [dispatch, filters]);
    const update = (next) => setFilters((current) => ({ ...current, ...next }));

    const remove = async () => {
        const result = await dispatch(deleteAdminTrain(deleting._id));
        if (result.meta.requestStatus === "fulfilled") toast.success("Train deleted"); else toast.error(result.error?.message || "Unable to delete train");
        setDeleting(null);
    };

    const columns = [
        { key: "train", label: "Train" },
        { key: "route", label: "Stations" },
        { key: "journey", label: "Journey" },
        { key: "coaches", label: "Coaches" },
        { key: "availability", label: "Availability" },
        { key: "status", label: "Status" },
        { key: "actions", label: "" },
    ];

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Rail inventory</p>
                    <h1>Trains</h1>
                </div>
                <button className="admin-primary" onClick={() => setEditing({})}><Plus size={15} /> Add train</button>
            </div>

            <DataToolbar filters={filters} onChange={update} statuses={false} />

            <div className="flight-filter">
                <select value={filters.status} onChange={(event) => update({ status: event.target.value, page: 1 })}>
                    <option value="">All train statuses</option>
                    {['Active', 'Inactive', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}
                </select>
            </div>

            {loading ? (
                <Skeleton />
            ) : (
                <AdminDataTable
                    columns={columns}
                    rows={items}
                    rowKey="_id"
                    renderCell={(train, key) => {
                        if (key === "train") return <><b>{train.trainNumber}</b><small>{train.trainName}</small></>;
                        if (key === "route") return <StationMap stations={(train.route || []).slice(0, 10)} />;
                        if (key === "journey") return train.journeyTime || `${train.journeyHours || 0}h ${train.journeyMinutes || 0}m`;
                        if (key === "coaches") return (train.coaches || []).length;
                        if (key === "availability") return `${(train.coaches || []).reduce((s, c) => s + ((c.seats || []).filter(Boolean).length || 0), 0)} seats`;
                        if (key === "status") return train.status;
                        if (key === "actions") return (
                            <>
                                <button className="admin-secondary" onClick={() => setEditing(train)}>Edit</button>
                                <button className="admin-secondary" onClick={() => setDeleting(train)}>Delete</button>
                            </>
                        );
                        return null;
                    }}
                />
            )}

            <Pagination pagination={pagination} onPage={(page) => update({ page })} />

            {editing && <TrainForm train={editing} onClose={() => { setEditing(null); dispatch(fetchAdminTrains(filters)); }} />}
            <ConfirmDialog open={!!deleting} title={`Delete train`} message={`Delete ${deleting?.trainName || 'this train'}?`} onConfirm={remove} onCancel={() => setDeleting(null)} confirmText="Delete" />
        </>
    );
}
