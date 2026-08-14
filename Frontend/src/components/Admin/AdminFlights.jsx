import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Download, FileUp, Plane, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { bulkDeleteAdminFlights, createAdminFlight, deleteAdminFlight, fetchAdminFlights, importAdminFlights, updateAdminFlight } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { AdminDataTable, ConfirmDialog, DataToolbar, EmptyState, Pagination, Skeleton, StationMap } from "./AdminShared";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const blankFlight = { flightNumber: "", airline: "", aircraft: "", from: "", to: "", sourceAirport: "", destinationAirport: "", departureTime: "", arrivalTime: "", duration: "", durationHours: 0, durationMinutes: 0, stops: 0, status: "Scheduled", basePrice: "", days: DAYS, seats: [] };

function SeatEditor({ seats = [], onChange }) {
    const [rows, setRows] = useState(0);
    const [columns, setColumns] = useState(6);
    const generate = () => {
        const r = Math.max(0, Math.floor(Number(rows) || 0));
        const c = Math.max(0, Math.floor(Number(columns) || 0));
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, c).split("");
        onChange(Array.from({ length: r }, (_, row) => letters.map((letter, col) => ({
            seatNumber: `${row + 1}${letter}`,
            seatClass: "Economy",
            seatPosition: col === 0 || col === c - 1 ? "Window" : col % 3 === 1 ? "Middle" : "Aisle",
            status: "Available",
        }))).flat());
    };
    const update = (number, changes) => onChange(seats.map((s) => (s.seatNumber === number ? { ...s, ...changes } : s)));
    return (
        <section className="seat-editor">
            <div className="seat-editor-head">
                <div>
                    <h3>Seat layout</h3>
                    <p>Create seats or edit individual seat class and status.</p>
                </div>
                <div className="seat-generator">
                    <label>Rows<input min="1" max="99" type="number" value={rows} onChange={(e) => setRows(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Seat rows" /></label>
                    <label>Columns<input min="1" max="10" type="number" value={columns} onChange={(e) => setColumns(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Seat columns" /></label>
                    <button type="button" className="admin-secondary" onClick={generate} aria-label="Generate seats">Generate seats</button>
                </div>
            </div>

            {seats.length ? (
                <div className="seat-grid">
                    {seats.map((seat) => (
                        <button key={seat.seatNumber} type="button" className={`seat-cell ${seat.status?.toLowerCase()}`} onClick={() => update(seat.seatNumber, { status: seat.status === "Available" ? "Blocked" : "Available" })}>
                            <b>{seat.seatNumber}</b>
                            <small>{seat.seatClass}</small>
                            <select value={seat.status} onClick={(e) => e.stopPropagation()} onChange={(e) => update(seat.seatNumber, { status: e.target.value })}>{["Available", "Blocked", "Reserved", "Booked"].map((s) => <option key={s}>{s}</option>)}</select>
                            <select value={seat.seatClass} onClick={(e) => e.stopPropagation()} onChange={(e) => update(seat.seatNumber, { seatClass: e.target.value })}>{["Economy", "Premium Economy", "Business", "First Class"].map((c) => <option key={c}>{c}</option>)}</select>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="seat-empty">Use the generator to create seats.</p>
            )}
        </section>
    );
}

function FlightForm({ flight, onClose }) {
    const dispatch = useDispatch();
    const flightId = flight?._id || flight?.id;
    const isEdit = Boolean(flightId);
    const [form, setForm] = useState(isEdit ? { ...flight, durationHours: flight.durationHours || 0, durationMinutes: flight.durationMinutes || 0 } : blankFlight);
    const [saving, setSaving] = useState(false);
    const set = (key, value) => setForm((cur) => ({ ...cur, [key]: value }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const duration = `${Number(form.durationHours || 0)}h ${Number(form.durationMinutes || 0)}m`;
        const payload = { ...form, duration };
        const action = isEdit ? updateAdminFlight({ id: flightId, payload }) : createAdminFlight(payload);
        const result = await dispatch(action);
        setSaving(false);
        if (result.meta.requestStatus === "fulfilled") { toast.success(`Flight ${isEdit ? "updated" : "created"}`); onClose(); } else toast.error(result.error?.message || "Unable to save flight");
    };

    return (
        <div className="admin-dialog-backdrop">
            <section className="flight-form-modal">
                <header>
                    <div>
                        <p>Flight management</p>
                        <h2>{isEdit ? "Edit flight" : "Create flight"}</h2>
                    </div>
                    <button className="admin-secondary" onClick={onClose}>Close</button>
                </header>

                <form onSubmit={submit}>
                    <div className="flight-form-grid">
                        {["flightNumber", "airline", "aircraft", "from", "to", "sourceAirport", "destinationAirport"].map((key) => (
                            <label key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}<input required value={form[key] || ""} onChange={(e) => set(key, e.target.value)} aria-label={key} /></label>
                        ))}

                        <label>Departure<input required type="time" value={form.departureTime || ""} onChange={(e) => set('departureTime', e.target.value)} aria-label="Departure time" /></label>
                        <label>Arrival<input required type="time" value={form.arrivalTime || ""} onChange={(e) => set('arrivalTime', e.target.value)} aria-label="Arrival time" /></label>

                        <label>Duration<div className="duration-inputs"><input min="0" type="number" value={form.durationHours || 0} onChange={(e) => set('durationHours', Number(e.target.value))} aria-label="Duration hours" /><input min="0" max="59" type="number" value={form.durationMinutes || 0} onChange={(e) => set('durationMinutes', Number(e.target.value))} aria-label="Duration minutes" /></div></label>

                        <label>Stops<input min="0" type="number" value={form.stops || 0} onChange={(e) => set('stops', Number(e.target.value))} aria-label="Stops" /></label>
                        <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}>{['Scheduled', 'Delayed', 'Cancelled', 'Inactive'].map(s => <option key={s}>{s}</option>)}</select></label>
                        <label>Base price<input type="number" min="0" value={form.basePrice || ""} onChange={(e) => set('basePrice', e.target.value)} aria-label="Base price" /></label>

                        <label className="flight-days">Operating days<div className="running-days">{DAYS.map((d) => (<label key={d} className="running-day"><input type="checkbox" checked={(form.days || []).includes(d)} onChange={(e) => { const next = new Set(form.days || []); if (e.target.checked) next.add(d); else next.delete(d); set('days', Array.from(next)); }} /> {d.slice(0, 3)}</label>))}</div></label>

                    </div>

                    <SeatEditor seats={form.seats || []} onChange={(s) => set('seats', s)} />

                    <div className="flight-form-buttons">
                        <button type="button" className="admin-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="admin-primary" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update flight' : 'Create flight')}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function AdminFlights() {
    const dispatch = useDispatch();
    const { items = [], pagination = {}, loading = false } = useSelector((s) => s.admin.flights || {});
    const [filters, setFilters] = useState({ page: 1, limit: 10, order: 'desc', status: '' });
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selected, setSelected] = useState([]);
    const inputRef = useRef();

    useEffect(() => { dispatch(fetchAdminFlights(filters)); }, [dispatch, filters]);
    const update = (next) => setFilters((c) => ({ ...c, ...next }));

    const remove = async () => { const ids = deleting === 'bulk' ? selected : [deleting._id]; const action = ids.length > 1 ? bulkDeleteAdminFlights(ids) : deleteAdminFlight(ids[0]); const result = await dispatch(action); if (result.meta.requestStatus === 'fulfilled') { toast.success('Flight records deleted'); setSelected([]); } else toast.error(result.error?.message || 'Unable to delete selected flight'); setDeleting(null); };

    const columns = [{ key: 'select', label: '' }, { key: 'flight', label: 'Flight' }, { key: 'route', label: 'Route' }, { key: 'schedule', label: 'Schedule' }, { key: 'seats', label: 'Seats' }, { key: 'price', label: 'Price' }, { key: 'actions', label: '' }];

    return (
        <>
            <div className="admin-page-heading">
                <div><p>Flight management</p><h1>Flights</h1></div>
                <div>
                    <input ref={inputRef} type="file" accept="text/csv" onChange={() => { }} style={{ display: 'none' }} />
                    <button className="admin-primary" onClick={() => setEditing({})}><Plus size={15} /> Add flight</button>
                </div>
            </div>

            <DataToolbar filters={filters} onChange={update} />

            {loading ? <Skeleton /> : (
                <AdminDataTable columns={columns} rows={items} rowKey="_id" renderCell={(flight, key) => {
                    if (key === 'flight') return <><b>{flight.flightNumber}</b><small>{flight.airline || flight.aircraft}</small></>;
                    if (key === 'route') return <StationMap stations={[flight.from, flight.to].filter(Boolean)} />;
                    if (key === 'schedule') return <><b>{flight.departureTime} – {flight.arrivalTime}</b><small>{flight.duration} · {flight.stops} stop{flight.stops === 1 ? '' : 's'}</small></>;
                    if (key === 'seats') return (flight.seats || []).length;
                    if (key === 'price') return flight.basePrice;
                    if (key === 'actions') return <><button className="admin-secondary" onClick={() => setEditing(flight)}>Edit</button><button className="admin-secondary" onClick={() => setDeleting(flight)}>Delete</button></>;
                    return null;
                }} />
            )}

            <Pagination pagination={pagination} onPage={(page) => update({ page })} />

            {editing && <FlightForm flight={editing} onClose={() => { setEditing(null); dispatch(fetchAdminFlights(filters)); }} />}
            <ConfirmDialog open={!!deleting} title={`Delete flight`} message={`Delete ${deleting?.flightNumber || 'this flight'}?`} onConfirm={remove} onCancel={() => setDeleting(null)} confirmText="Delete" />
        </>
    );
}
