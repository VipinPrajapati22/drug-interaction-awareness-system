import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: String,
    role: String,
    action: String,
    entity: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
