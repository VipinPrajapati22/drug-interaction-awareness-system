import { Parser } from "json2csv";
import { env } from "../config/env.js";
import ICSRReport from "../models/ICSRReport.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { classifySeverity, makeIcsrId } from "../utils/idGenerator.js";
import { nextId, store } from "../services/memoryStore.js";
import { audit } from "../services/auditService.js";

export const submitIcsr = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    icsrId: makeIcsrId(),
    severityClassification: classifySeverity(req.body.seriousness, req.body.reactionDescription),
    submittedBy: req.user?._id
  };
  const report = env.mongoUri ? await ICSRReport.create(payload) : { _id: nextId("icsr", store.icsrReports), ...payload, createdAt: new Date().toISOString() };
  if (!env.mongoUri) store.icsrReports.unshift(report);
  await audit({ actor: req.user?.email || "anonymous", role: req.user?.role || "User", action: "SUBMIT", entity: "ICSR", metadata: { icsrId: report.icsrId } });
  res.status(201).json({ data: report });
});

export const listIcsr = asyncHandler(async (_req, res) => {
  const data = env.mongoUri ? await ICSRReport.find({}).sort({ createdAt: -1 }).limit(200) : store.icsrReports;
  res.json({ data });
});

export const exportIcsr = asyncHandler(async (_req, res) => {
  const data = env.mongoUri ? await ICSRReport.find({}).lean() : store.icsrReports;
  const csv = new Parser({ fields: ["icsrId", "patientAge", "gender", "suspectedDrug", "reactionDescription", "seriousness", "outcome", "reporterType", "severityClassification"] }).parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment("icsr-reports.csv");
  res.send(csv);
});
