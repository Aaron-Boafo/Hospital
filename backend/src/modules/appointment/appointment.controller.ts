import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { appointmentService } from "./appointment.service.js";
import {
  appointmentStatusSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "./appointment.validation.js";

const uuidParam = z.uuid();

export const listAppointments = asyncHandler(async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const filters = {
    ...(date ? { date } : {}),
    ...(status ? { status: status as z.infer<typeof appointmentStatusSchema>["status"] } : {}),
  };
  res.json({ appointments: await appointmentService.listAppointments(filters) });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ appointment: await appointmentService.getAppointment(id) });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const input = createAppointmentSchema.parse(req.body);
  res.status(201).json({
    appointment: await appointmentService.createAppointment(input),
  });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updateAppointmentSchema.parse(req.body);
  res.json({ appointment: await appointmentService.updateAppointment(id, input) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const { status } = appointmentStatusSchema.parse(req.body);
  res.json({ appointment: await appointmentService.updateAppointmentStatus(id, status) });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  await appointmentService.deleteAppointment(id);
  res.status(204).send();
});
