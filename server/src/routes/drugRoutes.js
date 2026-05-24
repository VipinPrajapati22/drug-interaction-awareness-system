import { Router } from "express";
import { autocompleteDrugs, createDrug, deleteDrug, getDrugs, resolveDrugDetails, updateDrug } from "../controllers/drugController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();
router.get("/", getDrugs);
router.get("/autocomplete", autocompleteDrugs);
router.get("/resolve/:query", resolveDrugDetails);
router.post("/", protect, allowRoles("Admin", "Pharmacist"), createDrug);
router.put("/:id", protect, allowRoles("Admin", "Pharmacist"), updateDrug);
router.delete("/:id", protect, allowRoles("Admin"), deleteDrug);

export default router;
