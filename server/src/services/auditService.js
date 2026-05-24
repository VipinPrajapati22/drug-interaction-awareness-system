import { env } from "../config/env.js";
import AuditLog from "../models/AuditLog.js";
import { nextId, store } from "./memoryStore.js";

export const audit = async ({ actor = "system", role = "System", action, entity, metadata = {} }) => {
  const record = { actor, role, action, entity, metadata, createdAt: new Date() };
  if (env.mongoUri) return AuditLog.create(record);
  store.auditLogs.unshift({ _id: nextId("audit", store.auditLogs), ...record });
  return record;
};
