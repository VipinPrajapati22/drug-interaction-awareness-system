import { Router } from "express";
import { uploadExcel } from "../controllers/excelController.js";
import { allowRoles, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.post("/upload", protect, allowRoles("Admin"), upload.single("file"), uploadExcel);

export default router;
