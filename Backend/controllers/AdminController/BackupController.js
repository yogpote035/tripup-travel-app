const BackupModel = require("../../models/BackupModel");
const UserModel = require("../../models/UserModel");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const { createAuditLog } = require("../../Middleware/auditLogger");

const execPromise = promisify(exec);
const backupDir = path.join(__dirname, "../../backups");
const MYSQLDUMP_CMD = process.env.MYSQLDUMP_PATH || "mysqldump";
const MYSQL_CMD = process.env.MYSQL_PATH || "mysql";

async function commandExists(command) {
    const checker = process.platform === "win32" ? `where ${command}` : `which ${command}`;
    try {
        await execPromise(checker);
        return true;
    } catch {
        return false;
    }
}

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Create a manual backup
 */
module.exports.createBackup = async (req, res) => {
    try {
        const { description } = req.body;
        const user = await UserModel.findById(req.user.userId).select("name email").lean();

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupName = `backup-${timestamp}`;
        const backupPath = path.join(backupDir, `${backupName}.sql`);

        // Create backup record as IN_PROGRESS
        const backup = await BackupModel.create({
            backupName,
            backupType: "MANUAL",
            createdBy: {
                id: req.user.userId,
                name: user.name,
                email: user.email,
            },
            description,
            status: "IN_PROGRESS",
            backupPath,
            size: 0,
            duration: 0,
            collections: [],
        });

        // Perform backup in background
        performBackup(backupName, backupPath, backup._id).catch((err) => {
            console.error("Backup error:", err);
            BackupModel.findByIdAndUpdate(backup._id, {
                status: "FAILED",
                errorMessage: err.message,
            });
        });

        // Log action
        await createAuditLog(req.user.userId, "ADMIN_BACKUP_CREATE", "Backup", backup._id.toString(), "SUCCESS", {
            backupName,
            description,
        });

        res.status(201).json({
            message: "Backup initiated",
            data: {
                backup: {
                    id: backup._id,
                    backupName,
                    status: "IN_PROGRESS",
                },
            },
        });
    } catch (error) {
        console.error("Error creating backup:", error);
        res.status(500).json({ message: "Error creating backup" });
    }
};

/**
 * Perform the actual backup using mysqldump.
 */
async function performBackup(backupName, backupPath, backupId) {
    const startTime = Date.now();

    try {
        const hasMysqldump = await commandExists(MYSQLDUMP_CMD);
        if (!hasMysqldump) {
            throw new Error(`mysqldump is not installed or not available on PATH. Set MYSQLDUMP_PATH if needed. Tried: ${MYSQLDUMP_CMD}`);
        }
        const host = process.env.TIDB_HOST || process.env.DB_HOST || "localhost";
        const port = process.env.TIDB_PORT || process.env.DB_PORT || "4000";
        const user = process.env.TIDB_USER || process.env.DB_USER || "root";
        const database = process.env.TIDB_DATABASE || process.env.DB_NAME || "tripup";
        const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD || "";
        const command = `${MYSQLDUMP_CMD} --host="${host}" --port="${port}" --user="${user}" ${password ? `--password="${password}"` : ""} --single-transaction --routines --events --result-file="${backupPath}" "${database}"`;
        await execPromise(command);

        // Get file size
        const stats = fs.statSync(backupPath);
        const size = stats.size;
        const duration = Date.now() - startTime;

        // Get collection stats
        const collections = await getCollectionStats();

        // Update backup record
        await BackupModel.findByIdAndUpdate(backupId, {
            status: "COMPLETED",
            size,
            collections,
            duration,
        });

        console.log(`Backup completed: ${backupName} (${size} bytes)`);
    } catch (error) {
        console.error(`Backup failed for ${backupName}:`, error);
        await BackupModel.findByIdAndUpdate(backupId, {
            status: "FAILED",
            errorMessage: error.message,
        });
        throw error;
    }
}

/**
 * Get collection statistics
 */
async function getCollectionStats() {
    try {
        const { query } = require("../../database/connection");
        const tables = await query("SELECT table_name AS name, table_rows AS documentCount FROM information_schema.tables WHERE table_schema = DATABASE()");
        return tables;
    } catch (error) {
        console.error("Error getting collection stats:", error);
        return [];
    }
}

/**
 * Get all backups
 */
module.exports.getBackups = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const [backups, total] = await Promise.all([
            BackupModel.find()
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            BackupModel.countDocuments(),
        ]);

        // Populate missing size/duration/collections from filesystem when possible
        await Promise.all(
            backups.map(async (b) => {
                try {
                    if ((!b.size || b.size === 0) && b.backupPath) {
                        const stat = await fs.promises.stat(b.backupPath).catch(() => null);
                        if (stat && typeof stat.size === "number") {
                            b.size = stat.size;
                        }
                    }
                    if (!Array.isArray(b.collections)) b.collections = b.collections || [];
                    if (b.duration == null) b.duration = b.duration || 0;
                } catch (err) {
                    // ignore per-record file errors
                }
            })
        );

        res.json({
            data: {
                items: backups,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching backups:", error);
        res.status(500).json({ message: "Error fetching backups" });
    }
};

/**
 * Restore from backup
 */
module.exports.restoreBackup = async (req, res) => {
    try {
        const { backupId } = req.body;
        const backup = await BackupModel.findById(backupId);

        if (!backup) {
            return res.status(404).json({ message: "Backup not found" });
        }

        if (backup.status !== "COMPLETED") {
            return res.status(400).json({ message: "Can only restore from completed backups" });
        }

        if (!fs.existsSync(backup.backupPath)) {
            return res.status(400).json({ message: "Backup file not found" });
        }

        const user = await UserModel.findById(req.user.userId).select("name").lean();

        // Perform restore in background
        performRestore(backup, req.user.userId, user.name).catch((err) => {
            console.error("Restore error:", err);
        });

        // Log action
        await createAuditLog(req.user.userId, "ADMIN_BACKUP_RESTORE", "Backup", backupId, "SUCCESS", {
            backupName: backup.backupName,
        });

        res.json({
            message: "Restore initiated. This may take a few minutes.",
            data: { backup },
        });
    } catch (error) {
        console.error("Error restoring backup:", error);
        res.status(500).json({ message: "Error restoring backup" });
    }
};

/**
 * Perform the actual restore using mysql.
 */
async function performRestore(backup, userId, userName) {
    try {
        const host = process.env.TIDB_HOST || process.env.DB_HOST || "localhost";
        const port = process.env.TIDB_PORT || process.env.DB_PORT || "4000";
        const user = process.env.TIDB_USER || process.env.DB_USER || "root";
        const database = process.env.TIDB_DATABASE || process.env.DB_NAME || "tripup";
        const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD || "";
        if (!(await commandExists(MYSQL_CMD))) throw new Error(`mysql client is not installed or not available on PATH. Set MYSQL_PATH if needed. Tried: ${MYSQL_CMD}`);
        const command = `${MYSQL_CMD} --host="${host}" --port="${port}" --user="${user}" ${password ? `--password="${password}"` : ""} "${database}" < "${backup.backupPath}"`;
        const startTime = Date.now();
        await execPromise(command);
        const duration = Date.now() - startTime;

        // Update backup record
        await BackupModel.findByIdAndUpdate(backup._id, {
            isRestored: true,
            restoredAt: new Date(),
            restoredBy: {
                id: userId,
                name: userName,
            },
        });

        console.log(`Restore completed from backup: ${backup.backupName}`);
    } catch (error) {
        console.error(`Restore failed for ${backup.backupName}:`, error);
        throw error;
    }
}

/**
 * Delete old backups (cleanup)
 */
module.exports.deleteOldBackups = async (req, res) => {
    try {
        const now = new Date();

        // Find backups past their retention date
        const oldBackups = await BackupModel.find({
            retention: { $lt: now },
        });

        // Delete files and database records
        for (const backup of oldBackups) {
            if (fs.existsSync(backup.backupPath)) {
                fs.unlinkSync(backup.backupPath);
            }
            await BackupModel.findByIdAndDelete(backup._id);
        }

        await createAuditLog(req.user.userId, "ADMIN_BACKUP_CREATE", "Backup", null, "SUCCESS", {
            action: "cleanup",
            deletedCount: oldBackups.length,
        });

        res.json({
            message: `Deleted ${oldBackups.length} old backups`,
            deletedCount: oldBackups.length,
        });
    } catch (error) {
        console.error("Error deleting old backups:", error);
        res.status(500).json({ message: "Error deleting backups" });
    }
};

/**
 * Schedule automated daily backups (call this from a cron job or startup)
 */
module.exports.scheduleAutomatedBackup = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupName = `automated-${timestamp}`;
        const backupPath = path.join(backupDir, `${backupName}.sql`);

        const backup = await BackupModel.create({
            backupName,
            backupType: "AUTOMATED",
            description: "Automated daily backup",
            status: "IN_PROGRESS",
            backupPath,
            createdBy: {
                name: "System",
                email: "system@tripup.com",
            },
        });

        await performBackup(backupName, backupPath, backup._id);
        console.log(`Automated backup completed: ${backupName}`);
    } catch (error) {
        console.error("Automated backup failed:", error);
    }
};

/**
 * Download backup file
 */
module.exports.downloadBackup = async (req, res) => {
    try {
        const { backupId } = req.params;
        const backup = await BackupModel.findById(backupId);

        if (!backup) {
            return res.status(404).json({ message: "Backup not found" });
        }

        if (!fs.existsSync(backup.backupPath)) {
            return res.status(400).json({ message: "Backup file not found on server" });
        }

        res.download(backup.backupPath, backup.backupName + ".sql");
    } catch (error) {
        console.error("Error downloading backup:", error);
        res.status(500).json({ message: "Error downloading backup" });
    }
};

/**
 * Delete a single backup by id (file + db record)
 */
module.exports.deleteBackup = async (req, res) => {
    try {
        const { backupId } = req.params;
        const backup = await BackupModel.findById(backupId);

        if (!backup) {
            return res.status(404).json({ message: "Backup not found" });
        }

        // Delete file if exists
        if (backup.backupPath && fs.existsSync(backup.backupPath)) {
            try {
                fs.unlinkSync(backup.backupPath);
            } catch (err) {
                console.warn("Failed to delete backup file:", err.message || err);
            }
        }

        // Remove DB record
        await BackupModel.findByIdAndDelete(backupId);

        // Log action (if user available)
        try {
            if (req.user && req.user.userId) {
                await createAuditLog(req.user.userId, "ADMIN_BACKUP_DELETE", "Backup", backupId, "SUCCESS", {
                    backupName: backup.backupName,
                });
            }
        } catch (logErr) {
            console.warn("Failed to create audit log for backup delete", logErr.message || logErr);
        }

        res.json({ message: "Backup deleted", data: { id: backupId } });
    } catch (error) {
        console.error("Error deleting backup:", error);
        res.status(500).json({ message: "Error deleting backup" });
    }
};
