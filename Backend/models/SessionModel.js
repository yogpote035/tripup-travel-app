const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    _id: { type: String }, // use string IDs (UUIDs) for sessions to support rotation and atomic ops
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    familyId: { type: String, required: true, index: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true, index: true },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date, default: null },
    revokeReason: { type: String, default: null },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index can be used to remove expired sessions asynchronously
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionModel = mongoose.model("SessionModel", SessionSchema);
module.exports = SessionModel;
