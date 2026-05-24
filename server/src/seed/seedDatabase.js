import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Drug from "../models/Drug.js";
import DrugInteraction from "../models/DrugInteraction.js";
import FoodInteraction from "../models/FoodInteraction.js";
import MedDRATerm from "../models/MedDRATerm.js";
import ICSRReport from "../models/ICSRReport.js";
import { drugs, drugInteractions, foodInteractions, meddraTerms, icsrReports, users } from "./seedData.js";

const seed = async () => {
  const connection = await connectDatabase();
  if (connection.mode !== "mongo") {
    console.log("Seed skipped because MONGO_URI is not set. Demo mode seeds automatically in memory.");
    return;
  }

  await Promise.all([
    User.deleteMany({}),
    Drug.deleteMany({}),
    DrugInteraction.deleteMany({}),
    FoodInteraction.deleteMany({}),
    MedDRATerm.deleteMany({}),
    ICSRReport.deleteMany({})
  ]);

  const hashedUsers = await Promise.all(users.map(async (user) => ({ ...user, password: await bcrypt.hash(user.password, 10) })));
  await User.insertMany(hashedUsers);
  await Drug.insertMany(drugs);
  await DrugInteraction.insertMany(drugInteractions);
  await FoodInteraction.insertMany(foodInteractions);
  await MedDRATerm.insertMany(meddraTerms);
  await ICSRReport.insertMany(icsrReports);
  console.log("Seed complete: 50 drugs, 30 DDIs, 20 food interactions, 25 MedDRA terms, 15 ICSRs.");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
