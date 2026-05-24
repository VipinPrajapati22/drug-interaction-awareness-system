import mongoose from "mongoose";

const counselingLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patientProfile: {
      ageGroup: String,
      pregnancy: Boolean,
      kidneyDisease: Boolean,
      liverDisease: Boolean,
      selfMedication: Boolean
    },
    medicines: [String],
    warnings: [{ level: String, title: String, message: String }],
    recommendationSummary: String
  },
  { timestamps: true }
);

export default mongoose.model("CounselingLog", counselingLogSchema);
