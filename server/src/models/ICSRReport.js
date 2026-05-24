import mongoose from "mongoose";

const icsrReportSchema = new mongoose.Schema(
  {
    icsrId: { type: String, required: true, unique: true },
    patientAge: Number,
    gender: { type: String, enum: ["Female", "Male", "Other", "Unknown"], default: "Unknown" },
    suspectedDrug: String,
    concomitantDrugs: [String],
    reactionDescription: String,
    seriousness: String,
    outcome: String,
    reporterType: { type: String, enum: ["Patient", "Pharmacist", "Physician", "Student", "Caregiver", "Other"], default: "Patient" },
    severityClassification: { type: String, enum: ["Minor", "Moderate", "Severe"], default: "Minor" },
    meddraTerms: [{ soc: String, pt: String, llt: String }],
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("ICSRReport", icsrReportSchema);
