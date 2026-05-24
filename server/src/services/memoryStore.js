import bcrypt from "bcryptjs";
import { drugs, drugInteractions, foodInteractions, meddraTerms, icsrReports, users } from "../seed/seedData.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const store = {
  users: [],
  drugs: [],
  drugInteractions: [],
  foodInteractions: [],
  meddraTerms: [],
  icsrReports: [],
  counselingLogs: [],
  auditLogs: [],
  uploads: [],
  externalSearchCache: []
};

export const seedMemoryStore = async () => {
  store.users = await Promise.all(users.map(async (user) => ({ ...user, password: await bcrypt.hash(user.password, 10) })));
  store.drugs = clone(drugs).map((item, index) => ({ ...item, _id: `drug-${index + 1}` }));
  store.drugInteractions = clone(drugInteractions).map((item, index) => ({ ...item, _id: `ddi-${index + 1}` }));
  store.foodInteractions = clone(foodInteractions).map((item, index) => ({ ...item, _id: `food-${index + 1}` }));
  store.meddraTerms = clone(meddraTerms).map((item, index) => ({ ...item, _id: `meddra-${index + 1}` }));
  store.icsrReports = clone(icsrReports).map((item, index) => ({ ...item, _id: `icsr-${index + 1}`, createdAt: new Date(Date.now() - index * 86400000).toISOString() }));
};

export const nextId = (prefix, collection) => `${prefix}-${collection.length + 1}`;
