import { Router } from "express";
import { analytics } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/analytics", protect, analytics);

export default router;
