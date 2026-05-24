import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { nextId, store } from "../services/memoryStore.js";
import { audit } from "../services/auditService.js";

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const sanitize = (user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role, favorites: user.favorites || [], searchHistory: user.searchHistory || [] });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "User" } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email, and password are required.");
  const allowedRole = ["Admin", "Pharmacist", "User"].includes(role) ? role : "User";
  const hashed = await bcrypt.hash(password, 10);

  let user;
  if (env.mongoUri) {
    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, "Email is already registered.");
    user = await User.create({ name, email, password: hashed, role: allowedRole });
  } else {
    if (store.users.some((item) => item.email === email.toLowerCase())) throw new ApiError(409, "Email is already registered.");
    user = { _id: nextId("user", store.users), name, email: email.toLowerCase(), password: hashed, role: allowedRole, favorites: [], searchHistory: [] };
    store.users.push(user);
  }

  await audit({ actor: email, role: allowedRole, action: "REGISTER", entity: "User" });
  res.status(201).json({ token: signToken(user), user: sanitize(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = env.mongoUri ? await User.findOne({ email }).select("+password") : store.users.find((item) => item.email === String(email).toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid email or password.");
  await audit({ actor: user.email, role: user.role, action: "LOGIN", entity: "User" });
  res.json({ token: signToken(user), user: sanitize(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitize(req.user) });
});
