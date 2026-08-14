const AuditLogModel = require("../../models/AuditLogModel");
const SystemMetricsModel = require("../../models/SystemMetricsModel");
const BackupModel = require("../../models/BackupModel");
const UserModel = require("../../models/UserModel");
const os = require("os");
const fs = require("fs");
const path = require("path");

/**
 * Get audit logs with filters
 */
module.exports.getAuditLogs = async (req, res) => {
    try {
        const {
            userId,
            action,
            resource,
            isAdmin,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));

        const filter = {};
        if (userId) filter["user.id"] = userId;
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (isAdmin !== undefined) filter.isAdmin = isAdmin === "true";

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            AuditLogModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            AuditLogModel.countDocuments(filter),
        ]);

        res.json({
            data: {
                items: logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Error fetching audit logs" });
    }
};

/**
 * Get user-specific audit logs
 */
module.exports.getUserAuditLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const user = await UserModel.findById(userId).select("_id name email role").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const [logs, total] = await Promise.all([
            AuditLogModel.find({ "user.id": userId })
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            AuditLogModel.countDocuments({ "user.id": userId }),
        ]);

        res.json({
            user,
            logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching user audit logs:", error);
        res.status(500).json({ message: "Error fetching logs" });
    }
};

/**
 * Get admin-specific audit logs
 */
module.exports.getAdminAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const [logs, total] = await Promise.all([
            AuditLogModel.find({ isAdmin: true })
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            AuditLogModel.countDocuments({ isAdmin: true }),
        ]);

        res.json({
            data: {
                items: logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching admin logs:", error);
        res.status(500).json({ message: "Error fetching admin logs" });
    }
};

/**
 * Get system metrics
 */
module.exports.getSystemMetrics = async (req, res) => {
    try {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const uptime = process.uptime();
        const cpus = os.cpus();
        const cpuCount = cpus.length;
        const loadAverage = os.loadavg();

        const dbStatus = {
            connected: false,
            responseTime: 0,
            collections: 0,
            size: 0,
        };

        try {
            const { query } = require("../../database/connection");
            const start = Date.now();
            await query("SELECT 1 AS ok");
            dbStatus.connected = true;
            dbStatus.responseTime = Date.now() - start;
            const tables = await query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE()");
            dbStatus.collections = Number(tables[0]?.count || 0);
            const size = await query("SELECT COALESCE(SUM(data_length + index_length), 0) AS total FROM information_schema.tables WHERE table_schema = DATABASE()");
            dbStatus.size = Number(size[0]?.total || 0);
        } catch (dbError) {
            console.warn("Unable to collect database metrics", dbError.message || dbError);
        }

        const apiStatus = {
            totalRequests: 0,
            activeConnections: 0,
            requestsPerSecond: 0,
            averageResponseTime: 0,
            errorRate: 0,
        };

        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            const recentRequests = await AuditLogModel.find({ createdAt: { $gte: oneMinuteAgo } }).lean();
            apiStatus.totalRequests = await AuditLogModel.countDocuments();
            apiStatus.requestsPerSecond = recentRequests.length / 60;
            apiStatus.errorRate = recentRequests.length
                ? (recentRequests.filter((item) => item.status === "FAILURE").length / recentRequests.length) * 100
                : 0;
            const durations = recentRequests.map((item) => item.duration || 0).filter(Number.isFinite);
            apiStatus.averageResponseTime = durations.length
                ? durations.reduce((sum, value) => sum + value, 0) / durations.length
                : 0;
            apiStatus.activeConnections = 0;
        } catch (apiError) {
            console.warn("Unable to collect API metrics", apiError.message || apiError);
        }

        const storageStatus = {
            used: os.totalmem() - os.freemem(),
            available: os.freemem(),
            percentage: os.totalmem() ? ((os.totalmem() - os.freemem()) / os.totalmem()) * 100 : 0,
        };

        const metrics = {
            server: {
                uptime,
                memoryUsage: {
                    heapUsed: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal,
                    external: memUsage.external,
                    rss: memUsage.rss,
                },
                cpuUsage: {
                    percent: Math.min(100, (loadAverage[0] / cpuCount) * 100),
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                },
                loadAverage,
            },
            node: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                cpuCount,
            },
            system: {
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                uptime: os.uptime(),
            },
            database: dbStatus,
            api: apiStatus,
            storage: storageStatus,
            timestamp: new Date(),
        };

        // Save to database for historical tracking
        await SystemMetricsModel.create(metrics);

        res.json({ data: metrics });
    } catch (error) {
        console.error("Error fetching system metrics:", error);
        res.status(500).json({ message: "Error fetching metrics" });
    }
};

/**
 * Get recent system errors from audit logs
 */
module.exports.getSystemErrors = async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const errors = await AuditLogModel.find({
            status: "FAILURE",
            createdAt: { $gte: since },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const summary = await AuditLogModel.aggregate([
            {
                $match: {
                    status: "FAILURE",
                    createdAt: { $gte: since },
                },
            },
            {
                $group: {
                    _id: "$endpoint",
                    count: { $sum: 1 },
                    lastError: { $max: "$createdAt" },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        res.json({
            data: {
                errors,
                summary,
                timeframe: `Last ${hours} hours`,
            },
        });
    } catch (error) {
        console.error("Error fetching system errors:", error);
        res.status(500).json({ message: "Error fetching errors" });
    }
};

/**
 * Get activity statistics
 */
module.exports.getActivityStats = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const stats = {
            totalRequests: await AuditLogModel.countDocuments({
                createdAt: { $gte: since },
            }),
            successRequests: await AuditLogModel.countDocuments({
                status: "SUCCESS",
                createdAt: { $gte: since },
            }),
            failedRequests: await AuditLogModel.countDocuments({
                status: "FAILURE",
                createdAt: { $gte: since },
            }),
            activeUsers: await AuditLogModel.distinct("user.id", {
                createdAt: { $gte: since },
            }).then((users) => users.length),
            activeAdmins: await AuditLogModel.distinct("user.id", {
                isAdmin: true,
                createdAt: { $gte: since },
            }).then((admins) => admins.length),
            actionBreakdown: await AuditLogModel.aggregate([
                {
                    $match: { createdAt: { $gte: since } },
                },
                {
                    $group: {
                        _id: "$action",
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 },
                },
            ]),
        };

        res.json({ data: stats });
    } catch (error) {
        console.error("Error fetching activity stats:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};
