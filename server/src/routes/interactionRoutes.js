import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import { checkDrugInteractions, counseling, createDrugInteraction, exportInteractions, getInteractionHistory } from "../controllers/interactionController.js";

const router = Router();
router.post("/check", protect, checkDrugInteractions);
router.get("/history", protect, getInteractionHistory);
router.post("/", protect, allowRoles("Admin", "Pharmacist"), createDrugInteraction);
router.post("/counseling", protect, counseling);
router.get("/export", protect, allowRoles("Admin", "Pharmacist"), exportInteractions);

export default router;
