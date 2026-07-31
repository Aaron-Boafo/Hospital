import { z } from "zod";
import { APPOINTMENT_STATUSES } from "./appointment.constants.js";

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format");

export const createAppointmentSchema = z.object({
  patientId: z.uuid("Invalid patient id"),
  doctorId: z.uuid("Invalid doctor id"),
  date: dateString,
  time: timeString,
  notes: z.string().trim().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});
