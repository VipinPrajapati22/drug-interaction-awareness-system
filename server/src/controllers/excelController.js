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

export const uploadExcel = asyncHandler(async (req, res) => {
  const type = req.body.type || "drugs";
  if (!req.file) throw new ApiError(400, "XLSX, XLS, or CSV file is required.");
  if (!validators[type]) throw new ApiError(400, "Invalid import type.");

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const required = validators[type];
  const preview = rows.slice(0, 10);
  const invalidRows = rows
    .map((row, index) => ({ row: index + 2, missing: required.filter((field) => !row[field]) }))
    .filter((item) => item.missing.length);

  if (req.body.import === "true" && invalidRows.length === 0) {
    if (env.mongoUri) {
      const model = { drugs: Drug, interactions: DrugInteraction, food: FoodInteraction, icsr: ICSRReport }[type];
      await model.insertMany(rows);
    } else {
      const target = { drugs: "drugs", interactions: "drugInteractions", food: "foodInteractions", icsr: "icsrReports" }[type];
      rows.forEach((row) => store[target].push({ _id: nextId(type, store[target]), ...row }));
    }
  }

  store.uploads.unshift({ _id: nextId("upload", store.uploads), type, filename: req.file.originalname, rows: rows.length, invalidRows, createdAt: new Date() });
  fs.unlink(req.file.path, () => {});
  res.json({ type, totalRows: rows.length, preview, invalidRows, imported: req.body.import === "true" && invalidRows.length === 0 });
});
