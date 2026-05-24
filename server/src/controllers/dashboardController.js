import { env } from "../config/env.js";
import DrugInteraction from "../models/DrugInteraction.js";
import ICSRReport from "../models/ICSRReport.js";
import Drug from "../models/Drug.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { store } from "../services/memoryStore.js";

const countBy = (items, key) => items.reduce((acc, item) => {
  const value = typeof key === "function" ? key(item) : item[key];
  acc[value || "Unknown"] = (acc[value || "Unknown"] || 0) + 1;
  return acc;
}, {});

export const analytics = asyncHandler(async (_req, res) => {
  const [drugs, interactions, reports] = env.mongoUri
    ? await Promise.all([Drug.find({}).lean(), DrugInteraction.find({}).lean(), ICSRReport.find({}).sort({ createdAt: -1 }).lean()])
    : [store.drugs, store.drugInteractions, store.icsrReports];

  const severityDistribution = Object.entries(countBy(interactions, "severity")).map(([name, value]) => ({ name, value }));
  const topReportedDrugs = Object.entries(countBy(reports, "suspectedDrug")).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const adrTrends = Object.entries(countBy(reports, (report) => String(report.createdAt || new Date().toISOString()).slice(0, 10))).map(([date, count]) => ({ date, count })).slice(-14);
  const mostCommonInteractions = interactions.slice(0, 8).map((item) => ({ name: item.drugs.join(" + "), severity: item.severity }));

  res.json({
    totals: { drugs: drugs.length, interactions: interactions.length, reports: reports.length },
    severityDistribution,
    topReportedDrugs,
    adrTrends,
    mostCommonInteractions,
    recentIcsrs: reports.slice(0, 6)
  });
});
