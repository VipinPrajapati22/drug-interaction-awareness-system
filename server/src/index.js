import fs from "fs";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { seedMemoryStore } from "./services/memoryStore.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:");
  console.error(err);
});

fs.mkdirSync("uploads", { recursive: true });

const boot = async () => {
  try {
    console.log("Starting DIAS...");

    const database = await connectDatabase();

    console.log("Database connected:", database.mode);

    if (database.mode === "memory") {
      await seedMemoryStore();
      console.log("Memory store seeded");
    }

    const PORT = process.env.PORT || env.port || 5000;

    app.listen(PORT, () => {
      console.log(`DIAS API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("BOOT ERROR:");
    console.error(error);
  }
};

boot();