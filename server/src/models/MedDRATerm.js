import mongoose from "mongoose";

const meddraTermSchema = new mongoose.Schema(
  {
    soc: { type: String, required: true },
    pt: { type: String, required: true },
    llt: { type: String, required: true },
    code: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("MedDRATerm", meddraTermSchema);
