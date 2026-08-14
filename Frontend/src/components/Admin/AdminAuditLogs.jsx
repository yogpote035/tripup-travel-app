import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAuditLogs,
    fetchUserAuditLogs,
    fetchAdminAuditLogs,
} from "../../../AllStatesFeatures/Admin/AdminSlice";
import { DataToolbar, Pagination, Skeleton, EmptyState } from "./AdminShared";
import { BarChart3, AlertCircle, CheckCircle } from "lucide-react";

const actionColors = {
    LOGIN: "bg-green-100 text-green-700",
    LOGOUT: "bg-blue-100 text-blue-700",
    SIGNUP: "bg-purple-100 text-purple-700",
    POST_CREATE: "bg-orange-100 text-orange-700",
    POST_UPDATE: "bg-yellow-100 text-yellow-700",
    POST_DELETE: "bg-red-100 text-red-700",
    BOOKING_CREATE: "bg-indigo-100 text-indigo-700",
    REVIEW_CREATE: "bg-pink-100 text-pink-700",
};

const resourceIcons = {
    USER: "👤",
    POST: "📝",
    BOOKING: "🎫",
    REVIEW: "⭐",
    ADMIN: "⚙️",
};

function AuditRow({ log }) {
    const isSuccess = log.status === "SUCCESS";
    const actionColor = actionColors[log.action] || "bg-gray-100 text-gray-700";

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium text-stone-800">{log.user?.name || "System"}</p>
                    <p className="text-xs text-stone-500">{log.user?.email}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor}`}>
                    {log.action}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{resourceIcons[log.resource] || "📦"}</span>
                    <div>
                        <p className="text-sm font-medium text-stone-700">{log.resource}</p>
                        <p className="text-xs text-stone-500">{log.endpoint}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    {isSuccess ? (
                        <CheckCircle size={14} className="text-green-600" fill="currentColor" />
                    ) : (
                        <AlertCircle size={14} className="text-red-600" fill="currentColor" />
                    )}
                    <span className={`text-sm font-medium ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                        {log.statusCode}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 text-xs text-stone-600">
                {log.ipAddress}
            </td>
            <td className="px-4 py-3 text-xs text-stone-600">
                {log.duration}ms
            </td>
            <td className="px-4 py-3 text-xs text-stone-500">
                {new Date(log.createdAt).toLocaleString()}
            </td>
            {log.errorMessage && (
                <td className="px-4 py-3 text-xs text-red-600">
                    {log.errorMessage}
                </td>
            )}
        </tr>
    );
}

export default function AdminAuditLogs() {
    const dispatch = useDispatch();
    const { auditLogs, userLogs, adminLogs } = useSelector((state) => state.admin);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        order: "desc",
        logType: "all", // all, user, admin
        action: "",
        resource: "",
        status: "",
    });
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    });

    useEffect(() => {
        if (filters.logType === "all") {
            dispatch(fetchAuditLogs(filters));
        } else if (filters.logType === "user") {
            dispatch(fetchUserAuditLogs(filters));
        } else if (filters.logType === "admin") {
            dispatch(fetchAdminAuditLogs(filters));
        }
    }, [dispatch, filters]);

    const update = (next) => setFilters((current) => ({ ...current, ...next, page: 1 }));

    let currentData = auditLogs;
    let currentPagination = auditLogs.pagination;

    if (filters.logType === "user" && userLogs.items) {
        currentData = userLogs;
        currentPagination = userLogs.pagination;
    } else if (filters.logType === "admin" && adminLogs.items) {
        currentData = adminLogs;
        currentPagination = adminLogs.pagination;
    }

    const isLoading =
        (filters.logType === "all" && auditLogs.loading) ||
        (filters.logType === "user" && userLogs.loading) ||
        (filters.logType === "admin" && adminLogs.loading);

    const items = currentData.items || [];

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>System Monitoring</p>
                    <h1>Audit Logs</h1>
                </div>
            </div>

            {/* Log Type Selector */}
            <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <label style={{ fontSize: "14px", fontWeight: "500", color: "#71808c" }}>
                        Log Type:
                    </label>
                    <select
                        value={filters.logType}
                        onChange={(e) => update({ logType: e.target.value })}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e5ebee",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        <option value="all">All Activities</option>
                        <option value="user">User Activities</option>
                        <option value="admin">Admin Actions</option>
                    </select>

                    <select
                        value={filters.action}
                        onChange={(e) => update({ action: e.target.value })}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e5ebee",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="POST_CREATE">Post Created</option>
                        <option value="POST_UPDATE">Post Updated</option>
                        <option value="BOOKING_CREATE">Booking Created</option>
                        <option value="REVIEW_CREATE">Review Created</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => update({ status: e.target.value })}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e5ebee",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILURE">Failure</option>
                    </select>

                    <select
                        value={filters.order}
                        onChange={(e) => update({ order: e.target.value })}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e5ebee",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginLeft: "auto",
                        }}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Audit Logs Table */}
            <section className="admin-table-card">
                {isLoading ? (
                    <Skeleton rows={8} />
                ) : items.length ? (
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>Status</th>
                                <th>IP Address</th>
                                <th>Duration</th>
                                <th>Timestamp</th>
                                {filters.status === "FAILURE" && <th>Error</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((log) => (
                                <AuditRow key={log._id} log={log} />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState title="No audit logs found" description="No activities match your filters." />
                )}
            </section>

            {/* Pagination */}
            <Pagination
                pagination={currentPagination}
                onPage={(page) => update({ page })}
            />

            {/* Stats Summary */}
            <div
                style={{
                    marginTop: "30px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                }}
            >
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e5ebee",
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "8px" }}>
                        Total Logs
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#24313b" }}>
                        {currentPagination?.total || 0}
                    </p>
                </div>
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e5ebee",
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "8px" }}>
                        Success Rate
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>
                        95%
                    </p>
                </div>
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e5ebee",
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "8px" }}>
                        Page {filters.page} of {currentPagination?.pages || 1}
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                        {items.length} records
                    </p>
                </div>
            </div>
        </>
    );
}
