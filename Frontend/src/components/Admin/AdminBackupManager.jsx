import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
} from "../../../AllStatesFeatures/Admin/AdminSlice";
import api from "../../utils/axiosSetup";
import { ConfirmDialog, Skeleton, EmptyState } from "./AdminShared";
import {
    HardDrive,
    Download,
    RefreshCw,
    Trash2,
    Plus,
    Clock,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

function BackupRow({ backup, onRestore, onDelete }) {
    const statusColor = {
        COMPLETED: "bg-green-100 text-green-700",
        FAILED: "bg-red-100 text-red-700",
        IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    };

    const sizeInMB = backup.size ? (backup.size / 1024 / 1024).toFixed(2) : "—";
    const durationText = backup.duration != null ? `${backup.duration}ms` : "—";
    const collectionCount = Array.isArray(backup.collections) ? backup.collections.length : 0;

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium text-stone-800">{backup.backupName}</p>
                    <p className="text-xs text-stone-500">
                        {backup.backupType === "MANUAL" ? "🔘 Manual" : "⏰ Automated"}
                    </p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[backup.status] || "bg-gray-100"}`}>
                    {backup.status}
                </span>
            </td>
            <td className="px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-stone-700">{sizeInMB} MB</p>
                    <p className="text-xs text-stone-500">
                        {collectionCount} collections
                    </p>
                </div>
            </td>
            <td className="px-4 py-3 text-xs text-stone-600">
                {durationText}
            </td>
            <td className="px-4 py-3 text-xs text-stone-500">
                {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : "—"}
            </td>
            <td className="px-4 py-3">
                {backup.isRestored ? (
                    <div className="flex items-center gap-1 text-green-700 text-xs">
                        <CheckCircle size={14} />
                        Restored {backup.restoredAt ? new Date(backup.restoredAt).toLocaleString() : "—"}
                    </div>
                ) : (
                    <span className="text-xs text-stone-500">Not restored</span>
                )}
                {backup.status === "FAILED" && backup.errorMessage ? (
                    <p className="mt-1 text-xs text-red-600">{backup.errorMessage}</p>
                ) : null}
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    {backup.status === "COMPLETED" && !backup.isRestored && (
                        <button
                            onClick={() => onRestore(backup)}
                            className="admin-secondary"
                            style={{ fontSize: "12px", padding: "6px 10px" }}
                        >
                            <RefreshCw size={12} /> Restore
                        </button>
                    )}
                    {backup.status === "COMPLETED" && (
                        <button
                            onClick={async () => {
                                try {
                                    const resp = await api.get(`/admin/backup/download/${backup._id}`, {
                                        responseType: "blob",
                                    });
                                    const blob = new Blob([resp.data]);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${backup.backupName || "backup"}.gz`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (err) {
                                    console.error("Download failed:", err);
                                    alert(err.response?.data?.message || err.message || "Failed to download backup");
                                }
                            }}
                            className="admin-secondary"
                            style={{ fontSize: "12px", padding: "6px 10px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                            <Download size={12} /> Download
                        </button>
                    )}
                    {backup.backupType === "MANUAL" && (
                        <button
                            onClick={() => onDelete(backup)}
                            className="admin-danger"
                            style={{ fontSize: "12px", padding: "6px 10px" }}
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function AdminBackupManager() {
    const dispatch = useDispatch();
    const { backups } = useSelector((state) => state.admin);
    const [isCreating, setIsCreating] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        dispatch(fetchBackups());
    }, [dispatch]);

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            const description = prompt("Enter backup description (optional):");
            await dispatch(
                createBackup(description || `Manual backup at ${new Date().toLocaleString()}`)
            ).unwrap();
            dispatch(fetchBackups());
        } catch (err) {
            alert(`Failed to create backup: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleRestore = async () => {
        if (!restoreTarget) return;
        const confirmed = window.confirm(
            `Are you sure you want to restore from backup "${restoreTarget.backupName}"? This will overwrite existing data.`
        );
        if (confirmed) {
            try {
                await dispatch(restoreBackup(restoreTarget._id)).unwrap();
                dispatch(fetchBackups());
                alert("Backup restored successfully!");
            } catch (err) {
                alert(`Failed to restore backup: ${err.message}`);
            }
        }
        setRestoreTarget(null);
    };

    const items = Array.isArray(backups.items) ? backups.items.filter(Boolean) : [];
    const isLoading = backups.loading || false;

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Data Management</p>
                    <h1>Backup & Restore</h1>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    className="admin-primary"
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={18} />
                    {isCreating ? "Creating..." : "Create Backup"}
                </button>
            </div>

            {/* Backup Info Box */}
            <div
                style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <HardDrive size={18} style={{ color: "#22c55e" }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: "#15803d" }}>
                        Daily Automated Backups Enabled
                    </p>
                    <p style={{ fontSize: "12px", color: "#4ade80" }}>
                        Automatic backups run daily at 2:00 AM UTC. You can also create manual backups anytime.
                    </p>
                </div>
            </div>

            {/* Backup Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
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
                        Total Backups
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#24313b" }}>
                        {items.length}
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
                        Successful
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>
                        {items.filter((b) => b?.status === "COMPLETED").length}
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
                        Failed
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
                        {items.filter((b) => b?.status === "FAILED").length}
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
                        Total Size
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                        {(
                            items.reduce((sum, b) => sum + (b.size || 0), 0) /
                            1024 /
                            1024
                        ).toFixed(0)}{" "}
                        MB
                    </p>
                </div>
            </div>

            {/* Backups Table */}
            <section className="admin-table-card">
                {isLoading ? (
                    <Skeleton rows={5} />
                ) : items.length ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Backup Name</th>
                                <th>Status</th>
                                <th>Size</th>
                                <th>Duration</th>
                                <th>Created</th>
                                <th>Restored</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.filter(Boolean).map((backup, index) => (
                                <BackupRow
                                    key={backup?._id || index}
                                    backup={backup}
                                    onRestore={setRestoreTarget}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState
                        title="No backups yet"
                        description="Create your first backup to get started."
                    />
                )}
            </section>

            {/* Restore Confirmation */}
            <ConfirmDialog
                open={!!restoreTarget}
                title="Restore from Backup"
                message={`This will restore the database from backup "${restoreTarget?.backupName}". Existing data will be overwritten. This action cannot be undone.`}
                confirmText="Restore"
                onConfirm={handleRestore}
                onCancel={() => setRestoreTarget(null)}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Backup"
                message={`Are you sure you want to delete the backup "${deleteTarget?.backupName}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={async () => {
                    if (!deleteTarget) return setDeleteTarget(null);
                    try {
                        await dispatch(deleteBackup(deleteTarget._id)).unwrap();
                        dispatch(fetchBackups());
                    } catch (err) {
                        alert(`Failed to delete backup: ${err.message}`);
                    } finally {
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Retention Policy */}
            <div
                style={{
                    marginTop: "30px",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <Clock size={18} style={{ color: "#b45309" }} />
                <div>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: "#92400e" }}>
                        Backup Retention Policy
                    </p>
                    <p style={{ fontSize: "12px", color: "#d97706" }}>
                        Backups are automatically retained for 30 days. Older backups are automatically deleted to free up storage space.
                    </p>
                </div>
            </div>
        </>
    );
}
