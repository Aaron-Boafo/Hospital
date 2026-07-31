import { z } from "zod";
import { BED_TYPES } from "./bed.constants.js";

export const createWardSchema = z.object({
  name: z.string().trim().min(1, "Ward name is required"),
  totalBeds: z.number().int().min(1, "Total beds must be at least 1"),
});

export const updateWardSchema = createWardSchema.partial();

export const createBedSchema = z.object({
  wardId: z.uuid("Invalid ward id"),
  number: z.number().int().min(1, "Bed number must be at least 1"),
  bedType: z.enum(BED_TYPES).optional(),
});

export const updateBedSchema = z.object({
  number: z.number().int().min(1, "Bed number must be at least 1").optional(),
  bedType: z.enum(BED_TYPES).optional(),
  status: z
    .enum(["AVAILABLE", "MAINTENANCE", "RESERVED"])
    .optional(),
});

export const admitSchema = z.object({
  patientId: z.uuid("Invalid patient id"),
});
