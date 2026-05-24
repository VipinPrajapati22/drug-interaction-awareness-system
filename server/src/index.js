import fs from "fs";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { seedMemoryStore } from "./services/memoryStore.js";

fs.mkdirSync("uploads", { recursive: true });

const boot = async () => {
  const database = await connectDatabase();
  if (database.mode === "memory") await seedMemoryStore();
  app.listen(env.port, () => {
console.log(`DIAS API running on port ${env.port}`);
  });
};

boot().catch((error) => {
  console.error(error);
  process.exit(1);
});
