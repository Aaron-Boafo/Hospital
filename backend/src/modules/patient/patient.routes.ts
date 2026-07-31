import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  addVital,
  addVisit,
  createPatient,
  deletePatient,
  getPatient,
  getVisits,
  getVitals,
  listPatients,
  updatePatient,
} from "./patient.controller.js";

const patientRouter = Router();

const patientGuard = requireRole("ADMIN", "DOCTOR", "RECEPTIONIST");

patientRouter.use(patientGuard);

patientRouter.get("/patients", listPatients);
patientRouter.post("/patients", createPatient);
patientRouter.get("/patients/:id", getPatient);
patientRouter.put("/patients/:id", updatePatient);
patientRouter.delete("/patients/:id", deletePatient);
patientRouter.get("/patients/:id/vitals", getVitals);
patientRouter.post("/patients/:id/vitals", addVital);
patientRouter.get("/patients/:id/visits", getVisits);
patientRouter.post("/patients/:id/visits", addVisit);

export { patientRouter };
