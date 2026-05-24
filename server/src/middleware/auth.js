import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { store } from "../services/memoryStore.js";
import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required.");
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = env.mongoUri ? await User.findById(decoded.id).select("-password") : store.users.find((item) => item._id === decoded.id);
    if (!user) throw new ApiError(401, "User no longer exists.");
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token."));
  }
};

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) return next(new ApiError(403, "Insufficient role permissions."));
  next();
};
