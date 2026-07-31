import { z } from "zod";
import { GENDERS } from "./patient.constants.js";

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  dob: dateString.optional(),
  gender: z.enum(GENDERS).optional(),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const vitalSignSchema = z.object({
  heartRate: z.number().int().positive().optional(),
  bloodPressure: z.string().trim().optional(),
  temperature: z.number().optional(),
  respiratoryRate: z.number().int().positive().optional(),
  oxygenSaturation: z.number().int().min(0).max(100).optional(),
  notes: z.string().trim().optional(),
});

export const visitRecordSchema = z.object({
  visitDate: dateString.optional(),
  reason: z.string().trim().optional(),
  diagnosis: z.string().trim().optional(),
  treatment: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
