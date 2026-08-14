/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Search } from "lucide-react";

export const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

export function Skeleton({ rows = 4 }) {
    return (
        <div className="admin-skeleton">{Array.from({ length: rows }, (_, index) => <i key={index} />)}</div>
    );
}

export function EmptyState({ title = "Nothing to show", description = "Try changing your filters or return later." }) {
    return (
        <div className="admin-empty"><AlertTriangle size={26} /><h3>{title}</h3><p>{description}</p></div>
    );
}

export function AdminErrorAlert({ error, onDismiss }) {
    if (!error) return null;
    return (
        <div className="admin-error-alert" role="alert">
            <AlertTriangle size={19} />
            <div><strong>Unable to load this data</strong><p>{error}</p></div>
            {onDismiss && <button type="button" aria-label="Dismiss error" onClick={onDismiss}>×</button>}
        </div>
    );
}

export function ConfirmDialog({ open, title, message, confirmText = "Confirm", onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="admin-dialog-backdrop" role="presentation">
            <section className="admin-dialog" role="dialog" aria-modal="true">
                <h2>{title}</h2>
                <p>{message}</p>
                <div>
                    <button className="admin-secondary" onClick={onCancel}>Cancel</button>
                    <button className="admin-danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </section>
        </div>
    );
}

export function DataToolbar({ filters, onChange, types = [], statuses = true }) {
    const [term, setTerm] = useState(filters.search || "");
    useEffect(() => setTerm(filters.search || ""), [filters.search]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (term !== filters.search) onChange({ search: term, page: 1 });
        }, 350);
        return () => clearTimeout(timer);
    }, [term, filters.search, onChange]);

    return (
        <div className="admin-toolbar">
            <label className="admin-search">
                <Search size={17} />
                <input aria-label="Search" value={term} placeholder="Search…" onChange={(event) => setTerm(event.target.value)} />
            </label>
            {types.length > 0 && (
                <select value={filters.type || ""} onChange={(event) => onChange({ type: event.target.value, page: 1 })}>
                    <option value="">All types</option>
                    {types.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
            )}
            {statuses && (
                <select value={filters.status || ""} onChange={(event) => onChange({ status: event.target.value, page: 1 })}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            )}
            <select value={filters.order || "desc"} onChange={(event) => onChange({ order: event.target.value, page: 1 })}>
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
            </select>
        </div>
    );
}

export function Pagination({ pagination, onPage }) {
    if (pagination.pages <= 1) return null;
    return (
        <div className="admin-pagination">
            <span>{pagination.total} results</span>
            <button disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}><ChevronLeft size={16} /> Prev</button>
            <b>{pagination.page} / {pagination.pages}</b>
            <button disabled={pagination.page >= pagination.pages} onClick={() => onPage(pagination.page + 1)}>Next <ChevronRight size={16} /></button>
        </div>
    );
}

export function AdminDataTable({ columns, rows, rowKey, renderCell, children }) {
    return (
        <section className="admin-table-card">
            {rows.length ? (
                <table>
                    <thead>
                        <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row[rowKey]}>
                                {columns.map((column) => (<td key={column.key}>{renderCell(row, column.key)}</td>))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                children
            )}
        </section>
    );
}

export function StationMap({ stations = [] }) {
    if (!stations || stations.length === 0) return null;
    return (
        <div className="station-map" aria-hidden="false">
            {stations.map((s, i) => (
                <span key={s} className="station-item">
                    <span className="station-name">{s}</span>
                    {i < stations.length - 1 && <span className="station-arrow">→</span>}
                </span>
            ))}
        </div>
    );
}
