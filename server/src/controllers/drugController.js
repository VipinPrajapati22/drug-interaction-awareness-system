import { env } from "../config/env.js";
import Drug from "../models/Drug.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { audit } from "../services/auditService.js";
import { nextId, store } from "../services/memoryStore.js";
import { globalDrugSearch, resolveDrug } from "../services/interaction.service.js";

const matchDrug = (drug, query) => {
  const text = `${drug.drugName} ${drug.genericName} ${drug.atcCode} ${drug.therapeuticClass}`.toLowerCase();
  return text.includes(String(query || "").toLowerCase());
};

export const getDrugs = asyncHandler(async (req, res) => {
  const { q = "", limit = 100, external = "true" } = req.query;
  const query = String(q).trim();
  const data = external === "true" && query
    ? await globalDrugSearch(query, { limit: Number(limit) })
    : env.mongoUri
      ? await Drug.find(query ? { $text: { $search: query } } : {}).limit(Number(limit)).sort({ drugName: 1 })
      : store.drugs.filter((drug) => matchDrug(drug, query)).slice(0, Number(limit));
  res.json({ data });
});

export const autocompleteDrugs = asyncHandler(async (req, res) => {
  const { q = "", limit = 12 } = req.query;
  const data = await globalDrugSearch(String(q), { limit: Number(limit) });
  res.json({ data });
});

export const resolveDrugDetails = asyncHandler(async (req, res) => {
  const drug = await resolveDrug(req.params.query, { forceRefresh: req.query.refresh === "true" });
  if (!drug) throw new ApiError(404, "Drug was not found locally or in external APIs.");
  res.json({ data: drug });
});

export const createDrug = asyncHandler(async (req, res) => {
  const required = ["drugName", "genericName", "atcCode", "therapeuticClass", "drugCode"];
  const missing = required.filter((key) => !req.body[key]);
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  const drug = env.mongoUri ? await Drug.create(req.body) : { _id: nextId("drug", store.drugs), ...req.body };
  if (!env.mongoUri) store.drugs.unshift(drug);
  await audit({ actor: req.user.email, role: req.user.role, action: "CREATE", entity: "Drug", metadata: { drugName: drug.drugName } });
  res.status(201).json({ data: drug });
});

export const updateDrug = asyncHandler(async (req, res) => {
  const drug = env.mongoUri
    ? await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    : Object.assign(store.drugs.find((item) => item._id === req.params.id) || {}, req.body);
  if (!drug?._id) throw new ApiError(404, "Drug not found.");
  await audit({ actor: req.user.email, role: req.user.role, action: "UPDATE", entity: "Drug", metadata: { id: req.params.id } });
  res.json({ data: drug });
});

export const deleteDrug = asyncHandler(async (req, res) => {
  if (env.mongoUri) await Drug.findByIdAndDelete(req.params.id);
  else store.drugs = store.drugs.filter((item) => item._id !== req.params.id);
  await audit({ actor: req.user.email, role: req.user.role, action: "DELETE", entity: "Drug", metadata: { id: req.params.id } });
  res.json({ message: "Drug deleted." });
});
