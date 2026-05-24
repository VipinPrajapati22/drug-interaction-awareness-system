import { Parser } from "json2csv";
import { env } from "../config/env.js";
import DrugInteraction from "../models/DrugInteraction.js";
import FoodInteraction from "../models/FoodInteraction.js";
import CounselingLog from "../models/CounselingLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findDrugInteractions, findFoodInteractions, buildCounselingWarnings } from "../services/interactionService.js";
import { buildAdvancedCounselingWarnings, checkInteractions, resolveDrug } from "../services/interaction.service.js";
import { nextId, store } from "../services/memoryStore.js";

export const checkDrugInteractions = asyncHandler(async (req, res) => {
  const { drugs = [], severity = "All" } = req.body;
  const externalResults = await checkInteractions({ drugs, severity });
  if (req.user) req.user.searchHistory?.unshift?.({ query: drugs.join(" + "), type: "drug-interaction", createdAt: new Date() });
  res.json(externalResults);
});

export const getInteractionHistory = asyncHandler(async (req, res) => {
  res.json({ data: req.user?.searchHistory || [] });
});

export const checkFoodInteractions = asyncHandler(async (req, res) => {
  const { drug, food = "" } = req.body;
  const interactions = env.mongoUri ? await FoodInteraction.find({}) : store.foodInteractions;
  const results = findFoodInteractions(interactions, drug, food);
  res.json({ drug, food, count: results.length, results });
});

export const createDrugInteraction = asyncHandler(async (req, res) => {
  const record = env.mongoUri ? await DrugInteraction.create(req.body) : { _id: nextId("ddi", store.drugInteractions), ...req.body };
  if (!env.mongoUri) store.drugInteractions.unshift(record);
  res.status(201).json({ data: record });
});

export const createFoodInteraction = asyncHandler(async (req, res) => {
  const record = env.mongoUri ? await FoodInteraction.create(req.body) : { _id: nextId("food", store.foodInteractions), ...req.body };
  if (!env.mongoUri) store.foodInteractions.unshift(record);
  res.status(201).json({ data: record });
});

export const counseling = asyncHandler(async (req, res) => {
  const { medicines = [], patientProfile = {}, foods = [] } = req.body;
  const allFoodInteractions = env.mongoUri ? await FoodInteraction.find({}) : store.foodInteractions;
  const checked = await checkInteractions({ drugs: medicines, severity: "All" });
  const resolvedDrugs = checked.resolvedDrugs?.length ? checked.resolvedDrugs : (await Promise.all(medicines.map((drug) => resolveDrug(drug).catch(() => null)))).filter(Boolean);
  const interactions = checked.results;
  const foodMatches = foods.flatMap((food) => medicines.flatMap((drug) => findFoodInteractions(allFoodInteractions, drug, food)));
  const warnings = buildAdvancedCounselingWarnings({ medicines, patientProfile, interactions, foodInteractions: foodMatches, resolvedDrugs });
  const log = { user: req.user?._id, patientProfile, medicines, warnings, recommendationSummary: warnings[0]?.message || "No signal found." };
  if (env.mongoUri) await CounselingLog.create(log);
  else store.counselingLogs.unshift({ _id: nextId("counsel", store.counselingLogs), ...log, createdAt: new Date() });
  res.json({ warnings, interactions, foodInteractions: foodMatches, resolvedDrugs });
});

export const exportInteractions = asyncHandler(async (_req, res) => {
  const data = env.mongoUri ? await DrugInteraction.find({}).lean() : store.drugInteractions;
  const csv = new Parser({ fields: ["drugs", "severity", "mechanism", "clinicalEffect", "pharmacistRecommendation", "monitoringAdvice"] }).parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment("drug-interactions.csv");
  res.send(csv);
});
