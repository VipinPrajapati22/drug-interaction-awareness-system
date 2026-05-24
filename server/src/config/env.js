import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb+srv://DIAS:aofefgOxYV3cEoEX@cluster0.rzfd0zi.mongodb.net/drug_interaction_awareness?retryWrites=true&w=majority",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  demoMode: String(process.env.DEMO_MODE ?? "true").toLowerCase() === "true",
  openfdaApiKey: process.env.OPENFDA_API_KEY || ""
};
