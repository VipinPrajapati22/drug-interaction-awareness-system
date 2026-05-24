import dotenv from "dotenv";

dotenv.config();

const demoMode = String(process.env.DEMO_MODE ?? "true").toLowerCase() === "true";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: demoMode ? "" : process.env.MONGO_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  demoMode,
  openfdaApiKey: process.env.OPENFDA_API_KEY || ""
};
