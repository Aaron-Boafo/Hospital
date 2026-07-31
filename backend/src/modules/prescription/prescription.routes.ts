import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  createPrescription,
  dispensePrescription,
  getPrescription,
  listPrescriptions,
} from "./prescription.controller.js";

const prescriptionRouter = Router();

prescriptionRouter.use(requireRole("ADMIN", "DOCTOR"));

prescriptionRouter.get("/prescriptions", listPrescriptions);
prescriptionRouter.get("/prescriptions/:id", getPrescription);
prescriptionRouter.post("/prescriptions", createPrescription);
prescriptionRouter.post("/prescriptions/:id/dispense", dispensePrescription);

export { prescriptionRouter };
