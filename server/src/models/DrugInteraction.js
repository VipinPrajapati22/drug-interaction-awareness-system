import mongoose from "mongoose";

const drugInteractionSchema = new mongoose.Schema(
  {
    drugs: [{ type: String, required: true }],
    rxcuis: [{ type: String, index: true }],
    severity: { type: String, enum: ["Minor", "Moderate", "Severe", "Contraindicated"], required: true },
    mechanism: String,
    clinicalEffect: String,
    pharmacistRecommendation: String,
    monitoringAdvice: String,
    source: { type: String, enum: ["seed", "rxnav", "manual"], default: "manual" },
    interactionGroup: String,
    rawDescription: String,
    cachedAt: Date,
    cacheExpiresAt: Date,
    meddraTerms: [
      {
        soc: String,
        pt: String,
        llt: String
      }
    ],
    evidenceLevel: { type: String, enum: ["Theoretical", "Case report", "Observational", "Established"], default: "Established" }
  },
  { timestamps: true }
);

export default mongoose.model("DrugInteraction", drugInteractionSchema);
