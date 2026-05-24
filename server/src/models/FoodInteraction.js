import mongoose from "mongoose";

const foodInteractionSchema = new mongoose.Schema(
  {
    drug: { type: String, required: true, index: true },
    food: { type: String, required: true, index: true },
    severity: { type: String, enum: ["Minor", "Moderate", "Severe", "Contraindicated"], default: "Moderate" },
    pharmacologyExplanation: String,
    riskMechanism: String,
    patientCounselingAdvice: String
  },
  { timestamps: true }
);

export default mongoose.model("FoodInteraction", foodInteractionSchema);
