import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  createMedicine,
  deleteMedicine,
  getMedicine,
  listMedicines,
  updateMedicine,
} from "./medicine.controller.js";

const medicineRouter = Router();

medicineRouter.use(requireRole("ADMIN"));

medicineRouter.get("/medicines", listMedicines);
medicineRouter.get("/medicines/:id", getMedicine);
medicineRouter.post("/medicines", createMedicine);
medicineRouter.put("/medicines/:id", updateMedicine);
medicineRouter.delete("/medicines/:id", deleteMedicine);

export { medicineRouter };
