import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  createDoctor,
  getDoctor,
  listDoctors,
  toggleDoctorActive,
  updateDoctor,
} from "./doctor.controller.js";

const doctorRouter = Router();

doctorRouter.use(requireRole("ADMIN"));

doctorRouter.get("/doctors", listDoctors);
doctorRouter.get("/doctors/:id", getDoctor);
doctorRouter.post("/doctors", createDoctor);
doctorRouter.put("/doctors/:id", updateDoctor);
doctorRouter.patch("/doctors/:id/active", toggleDoctorActive);

export { doctorRouter };
