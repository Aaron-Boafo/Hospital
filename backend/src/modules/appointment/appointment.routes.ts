import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
  updateStatus,
} from "./appointment.controller.js";

const appointmentRouter = Router();

appointmentRouter.use(requireRole("ADMIN", "DOCTOR", "RECEPTIONIST"));

appointmentRouter.get("/appointments", listAppointments);
appointmentRouter.get("/appointments/:id", getAppointment);
appointmentRouter.post("/appointments", createAppointment);
appointmentRouter.put("/appointments/:id", updateAppointment);
appointmentRouter.patch("/appointments/:id/status", updateStatus);
appointmentRouter.delete("/appointments/:id", deleteAppointment);

export { appointmentRouter };
