import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    if (env.demoMode) {
      console.warn("MONGO_URI not set. Running with seeded in-memory demo data.");
      return { mode: "memory" };
    }
    throw new Error("MONGO_URI is required unless DEMO_MODE=true.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
  return { mode: "mongo" };
};
