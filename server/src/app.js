import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import drugRoutes from "./routes/drugRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import icsrRoutes from "./routes/icsrRoutes.js";
import excelRoutes from "./routes/excelRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Drug Interaction Awareness System", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/icsr", icsrRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
