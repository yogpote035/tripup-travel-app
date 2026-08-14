import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSystemMetrics,
    fetchSystemErrors,
    fetchActivityStats,
} from "../../../AllStatesFeatures/Admin/AdminSlice";
import { Skeleton, EmptyState } from "./AdminShared";
import {
    Activity,
    AlertCircle,
    BarChart3,
    Cpu,
    HardDrive,
    Zap,
    TrendingUp,
} from "lucide-react";

// Status indicator
function StatusIndicator({ status, label }) {
    const isHealthy = status === "healthy";
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-3 h-3 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"
                    }`}
            />
            <span className={`text-sm ${isHealthy ? "text-green-700" : "text-red-700"}`}>
                {label}
            </span>
        </div>
    );
}

// Metric card
function MetricCard({ icon: Icon, label, value, unit, status }) {
    return (
        <div className="admin-metric" style={{ minHeight: "120px" }}>
            <span>
                <Icon size={19} />
            </span>
            <p>{label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <strong>{value}</strong>
                <span style={{ fontSize: "12px", color: "#71808c" }}>{unit}</span>
            </div>
            {status && (
                <div style={{ fontSize: "11px", marginTop: "8px" }}>
                    <StatusIndicator status={status} label={status.toUpperCase()} />
                </div>
            )}
        </div>
    );
}

// Chart component
function SimpleChart({ data, title, type = "bar" }) {
    if (!data || data.length === 0) {
        return (
            <section className="admin-chart">
                <h2>{title}</h2>
                <EmptyState />
            </section>
        );
    }

    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <section className="admin-chart">
            <h2>{title}</h2>
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    height: "150px",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: `${Math.max(10, (item.value / max) * 100)}px`,
                                backgroundColor: "#f46e34",
                                borderRadius: "6px 6px 0 0",
                            }}
                        />
                        <small style={{ fontSize: "11px", textAlign: "center" }}>
                            {item.label}
                        </small>
                        <strong style={{ fontSize: "12px" }}>{item.value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function AdminSystemStatus() {
    const dispatch = useDispatch();
    const { systemMetrics, systemErrors, activityStats } = useSelector(
        (state) => state.admin
    );
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [uptimeSeconds, setUptimeSeconds] = useState(0);

    useEffect(() => {
        dispatch(fetchSystemMetrics());
        dispatch(fetchSystemErrors());
        dispatch(fetchActivityStats({ days: 7 }));
    }, [dispatch]);

    useEffect(() => {
        const timer = setInterval(() => {
            dispatch(fetchSystemMetrics());
        }, refreshInterval * 1000);
        return () => clearInterval(timer);
    }, [dispatch, refreshInterval]);

    // Keep a local second-by-second uptime counter so the UI shows live hh:mm:ss
    useEffect(() => {
        // initialize from server metrics when available
        const uptimeFromServer = systemMetrics?.data?.server?.uptime;
        if (Number.isFinite(Number(uptimeFromServer))) {
            setUptimeSeconds(Math.max(0, Math.floor(Number(uptimeFromServer))));
        }
    }, [systemMetrics?.data?.server?.uptime]);

    useEffect(() => {
        const tick = setInterval(() => {
            setUptimeSeconds((s) => s + 1);
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const metrics = systemMetrics.data || {};
    const errors = systemErrors.data?.errors || [];
    const activities = activityStats.data || {};

    const serverMetrics = metrics?.server || {};
    const dbMetrics = metrics?.database || {};
    const apiMetrics = metrics?.api || {};
    const storageMetrics = metrics?.storage || {};

    const formatNumber = (value, decimals = 1) => {
        const number = Number(value);
        return Number.isFinite(number) ? number.toFixed(decimals) : "0.0";
    };

    const uptimeHours = Number.isFinite(uptimeSeconds) ? uptimeSeconds / 3600 : 0;
    const cpuUsageValue = Number.isFinite(Number(serverMetrics.cpuUsage?.user))
        ? Number(serverMetrics.cpuUsage.user)
        : 0;
    const heapUsed = Number.isFinite(Number(serverMetrics.memoryUsage?.heapUsed))
        ? Number(serverMetrics.memoryUsage.heapUsed)
        : 0;
    const heapTotal = Number.isFinite(Number(serverMetrics.memoryUsage?.heapTotal))
        ? Number(serverMetrics.memoryUsage.heapTotal)
        : 1;

    // Calculate status
    const cpuStatus = cpuUsageValue > 80 ? "critical" : "healthy";
    const memoryStatus = ((heapUsed / heapTotal) * 100 > 80) ? "critical" : "healthy";
    const dbStatus = dbMetrics.connected ? "healthy" : "critical";

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>System Health</p>
                    <h1>Status Dashboard</h1>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", color: "#71808c" }}>Refresh:</label>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #e5ebee",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "12px",
                        }}
                    >
                        <option value={10}>Every 10s</option>
                        <option value={30}>Every 30s</option>
                        <option value={60}>Every 1m</option>
                    </select>
                    <button
                        className="admin-secondary"
                        onClick={() => {
                            dispatch(fetchSystemMetrics());
                            dispatch(fetchSystemErrors());
                        }}
                        style={{ marginLeft: "8px" }}
                    >
                        Refresh Now
                    </button>
                </div>
            </div>

            {/* Server Status Grid */}
            <div className="admin-metrics">
                <MetricCard
                    icon={Activity}
                    label="Server Uptime"
                    value={(() => {
                        const s = Math.max(0, Math.floor(uptimeSeconds || 0));
                        const hours = Math.floor(s / 3600);
                        const mins = Math.floor((s % 3600) / 60);
                        const secs = s % 60;
                        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
                    })()}
                    unit="hh:mm:ss"
                    status={uptimeSeconds > 0 ? "healthy" : "critical"}
                />

                <MetricCard
                    icon={Cpu}
                    label="CPU Usage"
                    value={formatNumber(cpuUsageValue, 1)}
                    unit="%"
                    status={cpuStatus}
                />

                <MetricCard
                    icon={HardDrive}
                    label="Memory Usage"
                    value={formatNumber((heapUsed / heapTotal) * 100, 1)}
                    unit="%"
                    status={memoryStatus}
                />

                <MetricCard
                    icon={TrendingUp}
                    label="Load Average"
                    value={formatNumber(serverMetrics.loadAverage?.[0] || 0, 2)}
                    unit="cores"
                />
            </div>

            {/* Database & API Metrics */}
            <div className="admin-charts-grid">
                <section className="admin-chart">
                    <h2>Database Status</h2>
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        <StatusIndicator
                            status={dbStatus}
                            label={`Connection: ${dbMetrics.connected ? "Connected" : "Disconnected"}`}
                        />
                        <div style={{ marginTop: "12px", fontSize: "13px", color: "#71808c" }}>
                            <p>Response Time: {dbMetrics.responseTime || 0}ms</p>
                            <p>Collections: {dbMetrics.collections || 0}</p>
                            <p>
                                Size:{" "}
                                {((dbMetrics.size || 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                </section>

                <section className="admin-chart">
                    <h2>API Performance</h2>
                    <div style={{ padding: "20px", fontSize: "13px", color: "#71808c" }}>
                        <p>
                            <strong>Requests/sec:</strong> {apiMetrics.requestsPerSecond || 0}
                        </p>
                        <p>
                            <strong>Avg Response:</strong> {apiMetrics.averageResponseTime || 0}ms
                        </p>
                        <p>
                            <strong>Error Rate:</strong> {apiMetrics.errorRate || 0}%
                        </p>
                        <p>
                            <strong>Active Connections:</strong>{" "}
                            {apiMetrics.activeConnections || 0}
                        </p>
                        <p>
                            <strong>Total Requests:</strong>{" "}
                            {(apiMetrics.totalRequests || 0).toLocaleString()}
                        </p>
                    </div>
                </section>

                <section className="admin-chart">
                    <h2>Storage</h2>
                    <div style={{ padding: "20px", fontSize: "13px", color: "#71808c" }}>
                        <p>
                            <strong>Used:</strong> {((storageMetrics.used || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
                        </p>
                        <p>
                            <strong>Available:</strong> {((storageMetrics.available || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
                        </p>
                        <p>
                            <strong>Usage:</strong> {storageMetrics.percentage || 0}%
                        </p>
                        <div
                            style={{
                                marginTop: "12px",
                                height: "8px",
                                backgroundColor: "#e5ebee",
                                borderRadius: "4px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    backgroundColor: "#f46e34",
                                    width: `${storageMetrics.percentage || 0}%`,
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Activity Stats */}
            {activities.actionBreakdown && (
                <SimpleChart
                    data={Object.entries(activities.actionBreakdown || {}).map(
                        ([action, count]) => ({
                            label: action,
                            value: count,
                        })
                    )}
                    title="Activity Breakdown (Last 7 Days)"
                />
            )}

            {/* Recent Errors */}
            <section className="admin-chart">
                <h2>Recent Errors (Last 24 Hours)</h2>
                {errors.length > 0 ? (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {errors.map((error, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: "12px",
                                    borderBottom: "1px solid #e5ebee",
                                    fontSize: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <AlertCircle size={14} className="text-red-600" />
                                    <strong style={{ color: "#24313b" }}>
                                        {error.errorCode} - {error.endpoint || "Unknown"}
                                    </strong>
                                    <span style={{ color: "#f97316", marginLeft: "auto" }}>
                                        {error.count} times
                                    </span>
                                </div>
                                <p style={{ color: "#71808c" }}>{error.message}</p>
                                <p style={{ color: "#a8a29e", marginTop: "4px" }}>
                                    Last: {new Date(error.lastOccurred).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState title="No errors" description="System is running smoothly" />
                )}
            </section>

            {/* Health Summary */}
            <div
                style={{
                    marginTop: "30px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "16px",
                }}
            >
                <div
                    style={{
                        backgroundColor: cpuStatus === "healthy" ? "#dcfce7" : "#fee2e2",
                        padding: "16px",
                        borderRadius: "12px",
                        border: `1px solid ${cpuStatus === "healthy" ? "#86efac" : "#fca5a5"}`,
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "4px" }}>
                        CPU Status
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {cpuStatus === "healthy" ? "✓ Healthy" : "⚠ Critical"}
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: memoryStatus === "healthy" ? "#dcfce7" : "#fee2e2",
                        padding: "16px",
                        borderRadius: "12px",
                        border: `1px solid ${memoryStatus === "healthy" ? "#86efac" : "#fca5a5"}`,
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "4px" }}>
                        Memory Status
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {memoryStatus === "healthy" ? "✓ Healthy" : "⚠ Critical"}
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: dbStatus === "healthy" ? "#dcfce7" : "#fee2e2",
                        padding: "16px",
                        borderRadius: "12px",
                        border: `1px solid ${dbStatus === "healthy" ? "#86efac" : "#fca5a5"}`,
                    }}
                >
                    <p style={{ fontSize: "12px", color: "#71808c", marginBottom: "4px" }}>
                        Database Status
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {dbStatus === "healthy" ? "✓ Connected" : "⚠ Disconnected"}
                    </p>
                </div>
            </div>
        </>
    );
}
