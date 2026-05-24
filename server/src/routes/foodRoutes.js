import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import { checkFoodInteractions, createFoodInteraction } from "../controllers/interactionController.js";

const router = Router();
router.post("/check", protect, checkFoodInteractions);
router.post("/", protect, allowRoles("Admin", "Pharmacist"), createFoodInteraction);

export default router;
