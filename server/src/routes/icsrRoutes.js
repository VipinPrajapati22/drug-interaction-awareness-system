import { Router } from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import { exportIcsr, listIcsr, submitIcsr } from "../controllers/icsrController.js";

const router = Router();
router.post("/report", protect, submitIcsr);
router.get("/reports", protect, allowRoles("Admin", "Pharmacist"), listIcsr);
router.get("/export", protect, allowRoles("Admin", "Pharmacist"), exportIcsr);

export default router;
