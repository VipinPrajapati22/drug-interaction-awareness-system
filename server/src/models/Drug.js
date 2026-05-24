import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
  {
    drugName: { type: String, required: true, index: true },
    genericName: { type: String, required: true, index: true },
    atcCode: { type: String, required: true },
    therapeuticClass: { type: String, required: true },
    dosageForm: String,
    route: String,
    strength: String,
    manufacturer: String,
    rxcui: { type: String, index: true },
    synonymNames: [{ type: String, index: true }],
    brandNames: [{ type: String, index: true }],
    contraindications: [String],
    indications: [String],
    warnings: [String],
    adverseReactions: [String],
    boxedWarnings: [String],
    pregnancyWarnings: [String],
    renalWarnings: [String],
    hepaticWarnings: [String],
    drugInteractionsLabel: [String],
    source: { type: String, enum: ["seed", "openfda-rxnorm", "manual"], default: "manual" },
    externalIds: {
      splId: String,
      setId: String,
      productNdc: [String],
      packageNdc: [String]
    },
    cachedAt: Date,
    cacheExpiresAt: Date,
    drugCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

drugSchema.index({
  drugName: "text",
  genericName: "text",
  brandNames: "text",
  synonymNames: "text",
  atcCode: "text",
  therapeuticClass: "text"
});

export default mongoose.model("Drug", drugSchema);
