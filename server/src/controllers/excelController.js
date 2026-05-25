import fs from "fs";
import XLSX from "xlsx";
import { env } from "../config/env.js";
import Drug from "../models/Drug.js";
import DrugInteraction from "../models/DrugInteraction.js";
import FoodInteraction from "../models/FoodInteraction.js";
import ICSRReport from "../models/ICSRReport.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { nextId, store } from "../services/memoryStore.js";

const validators = {
  drugs: ["drugName", "genericName", "atcCode", "therapeuticClass", "drugCode"],
  interactions: ["drugs", "severity", "mechanism"],
  food: ["drug", "food", "patientCounselingAdvice"],
  icsr: ["patientAge", "gender", "suspectedDrug", "reactionDescription"]
};

const cleanKey = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const getValue = (row, aliases) => {
  const lookup = Object.fromEntries(Object.entries(row).map(([key, value]) => [cleanKey(key), value]));
  for (const alias of aliases) {
    const value = lookup[cleanKey(alias)];
    if (value !== undefined && value !== "") return value;
  }
  return "";
};

const splitList = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeSeverity = (value, fallback = "Moderate") => {
  const severity = String(value || fallback).trim().toLowerCase();
  if (severity.startsWith("contra")) return "Contraindicated";
  if (severity.startsWith("sev") || severity === "major") return "Severe";
  if (severity.startsWith("min")) return "Minor";
  return "Moderate";
};

const detectType = (rows, requestedType) => {
  const sample = rows.find((row) => Object.keys(row).length) || {};
  const keys = Object.keys(sample).map(cleanKey);
  const has = (...names) => names.some((name) => keys.includes(cleanKey(name)));

  if ((has("drug1") && has("drug2")) || has("interactingDrug", "drugPair", "drugs")) return "interactions";
  if (has("food", "foodItem", "drink", "beverage") && has("drug", "medicine", "drugName")) return "food";
  if (has("suspectedDrug", "reactionDescription", "seriousness")) return "icsr";
  if (has("drugName", "genericName", "atcCode", "drugCode")) return "drugs";
  return requestedType;
};

const normalizeDrugRow = (row, index) => {
  const drugName = getValue(row, ["drugName", "drug", "medicine", "brandName"]);
  const genericName = getValue(row, ["genericName", "generic", "substance"]) || drugName;
  return {
    drugName,
    genericName,
    atcCode: getValue(row, ["atcCode", "atc"]) || "IMPORTED",
    therapeuticClass: getValue(row, ["therapeuticClass", "class", "category"]) || "Imported medicine",
    dosageForm: getValue(row, ["dosageForm", "form"]) || "Not specified",
    route: getValue(row, ["route", "routeOfAdministration"]) || "Not specified",
    strength: getValue(row, ["strength"]) || "Not specified",
    manufacturer: getValue(row, ["manufacturer", "company"]) || "Not specified",
    contraindications: splitList(getValue(row, ["contraindications", "contraindication"])),
    indications: splitList(getValue(row, ["indications", "indication", "uses"])),
    drugCode: getValue(row, ["drugCode", "code"]) || `IMP-DRUG-${String(index + 1).padStart(5, "0")}`,
    source: "manual"
  };
};

const normalizeInteractionRow = (row) => {
  const drug1 = getValue(row, ["drug1", "drugA", "primaryDrug", "drug"]);
  const drug2 = getValue(row, ["drug2", "drugB", "interactingDrug", "concomitantDrug"]);
  const drugs = splitList(getValue(row, ["drugs", "drugPair", "medicinePair"]));
  const pair = drugs.length >= 2 ? drugs.slice(0, 2) : [drug1, drug2].filter(Boolean);
  const description = getValue(row, ["interactionDescription", "description", "clinicalEffect", "effect", "risk"]);

  return {
    drugs: pair,
    severity: normalizeSeverity(getValue(row, ["severity", "riskLevel"])),
    mechanism: getValue(row, ["mechanism"]) || "Imported interaction pair; verify patient-specific risk before dispensing.",
    clinicalEffect: description || `${pair.join(" + ")} may require pharmacist review.`,
    pharmacistRecommendation: getValue(row, ["pharmacistRecommendation", "recommendation", "advice"]) || "Review indication, dose, duration, and safer alternatives.",
    monitoringAdvice: getValue(row, ["monitoringAdvice", "monitoring"]) || "Monitor for adverse effects and counsel the patient.",
    interactionGroup: getValue(row, ["interactionGroup", "group"]) || "Imported interactions",
    rawDescription: description || `${pair.join(" + ")} imported interaction`,
    source: "manual",
    evidenceLevel: getValue(row, ["evidenceLevel", "evidence"]) || "Theoretical"
  };
};

const normalizeFoodRow = (row) => {
  const drug = getValue(row, ["drug", "drugName", "medicine", "drug1"]);
  const food = getValue(row, ["food", "foodItem", "drink", "beverage", "drug2"]);
  return {
    drug,
    food,
    severity: normalizeSeverity(getValue(row, ["severity", "riskLevel"])),
    pharmacologyExplanation: getValue(row, ["pharmacologyExplanation", "explanation"]) || "Food or drink may alter response or tolerability.",
    riskMechanism: getValue(row, ["riskMechanism", "mechanism"]) || "Possible absorption, metabolism, or additive adverse-effect risk.",
    patientCounselingAdvice: getValue(row, ["patientCounselingAdvice", "counseling", "advice"]) || "Separate timing or avoid the combination when advised."
  };
};

const normalizeIcsrRow = (row) => ({
  patientAge: Number(getValue(row, ["patientAge", "age"])) || undefined,
  gender: getValue(row, ["gender", "sex"]) || "Unknown",
  suspectedDrug: getValue(row, ["suspectedDrug", "drug", "medicine"]),
  concomitantDrugs: splitList(getValue(row, ["concomitantDrugs", "concomitant", "drug2"])),
  reactionDescription: getValue(row, ["reactionDescription", "reaction", "adverseEvent", "description"]),
  seriousness: getValue(row, ["seriousness", "serious"]) || "Non-serious",
  outcome: getValue(row, ["outcome"]) || "Unknown",
  reporterType: getValue(row, ["reporterType", "reporter"]) || "Other"
});

const normalizers = {
  drugs: normalizeDrugRow,
  interactions: normalizeInteractionRow,
  food: normalizeFoodRow,
  icsr: normalizeIcsrRow
};

const validateRow = (type, row, index) => {
  if (type === "interactions") {
    const missing = [];
    if (!Array.isArray(row.drugs) || row.drugs.length < 2) missing.push("drug1/drug2 or drugs");
    if (!row.severity) missing.push("severity");
    if (!row.mechanism) missing.push("mechanism");
    return missing.length ? { row: index + 2, missing } : null;
  }

  const missing = validators[type].filter((field) => {
    const value = row[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
  return missing.length ? { row: index + 2, missing } : null;
};

export const uploadExcel = asyncHandler(async (req, res) => {
  const requestedType = req.body.type || "drugs";
  if (!req.file) throw new ApiError(400, "XLSX, XLS, or CSV file is required.");
  if (!validators[requestedType]) throw new ApiError(400, "Invalid import type.");

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const type = detectType(rows, requestedType);
  const normalizedRows = rows.map((row, index) => normalizers[type](row, index));
  const preview = normalizedRows.slice(0, 10);
  const invalidRows = normalizedRows.map((row, index) => validateRow(type, row, index)).filter(Boolean);

  if (req.body.import === "true" && invalidRows.length === 0) {
    if (env.mongoUri) {
      const model = { drugs: Drug, interactions: DrugInteraction, food: FoodInteraction, icsr: ICSRReport }[type];
      await model.insertMany(normalizedRows);
    } else {
      const target = { drugs: "drugs", interactions: "drugInteractions", food: "foodInteractions", icsr: "icsrReports" }[type];
      normalizedRows.forEach((row) => store[target].push({ _id: nextId(type, store[target]), ...row }));
    }
  }

  store.uploads.unshift({ _id: nextId("upload", store.uploads), requestedType, detectedType: type, filename: req.file.originalname, rows: rows.length, invalidRows, createdAt: new Date() });
  fs.unlink(req.file.path, () => {});
  res.json({
    requestedType,
    detectedType: type,
    type,
    totalRows: rows.length,
    validRows: rows.length - invalidRows.length,
    preview,
    invalidRows,
    imported: req.body.import === "true" && invalidRows.length === 0
  });
});
