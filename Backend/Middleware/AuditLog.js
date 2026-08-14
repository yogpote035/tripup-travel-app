const AuditLogModel = require("../models/AuditLogModel");
const { logger } = require("./Logger");

/** Persists audit events in the SQL audit_logs table. */
const createAuditLog = async (auditData) => {
  try {
    const entry = await AuditLogModel.create({
      user: auditData.userId ? { id: auditData.userId } : null,
      action: auditData.action,
      resource: auditData.resource,
      resourceId: String(auditData.resourceId || ""),
      status: auditData.status === "FAILED" ? "FAILURE" : "SUCCESS",
      errorMessage: auditData.reason || null,
      ipAddress: auditData.ip,
      userAgent: auditData.userAgent,
      metadata: { changes: auditData.changes || {}, ...(auditData.metadata || {}) },
    });
    logger.info(`Audit Log: ${auditData.action} on ${auditData.resource}`, { resourceId: auditData.resourceId });
    return entry;
  } catch (error) {
    logger.error("Failed to create audit log", { error: error.message });
    return null;
  }
};

const auditMiddleware = (action, resource) => (req, res, next) => {
  const originalSend = res.send;
  res.send = function auditResponse(data) {
    createAuditLog({
      userId: req.user?.userId,
      action,
      resource,
      resourceId: req.params.id || req.body?._id || req.body?.id || Date.now(),
      changes: { before: req.originalBody || null, after: req.body || null },
      ip: req.ip,
      userAgent: req.get("user-agent"),
      status: res.statusCode < 400 ? "SUCCESS" : "FAILED",
      reason: res.statusCode < 400 ? null : String(data || ""),
      metadata: { endpoint: req.originalUrl },
    });
    return originalSend.call(this, data);
  };
  req.originalBody = { ...(req.body || {}) };
  next();
};

module.exports = { AuditLog: AuditLogModel, createAuditLog, auditMiddleware };
