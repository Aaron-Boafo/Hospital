import { z } from "zod";
import { MEDICINE_CATEGORIES } from "./medicine.constants.js";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createMedicineSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.enum(MEDICINE_CATEGORIES, { message: "Invalid category" }),
  unitPrice: z.number().positive("Unit price must be positive"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  reorderLevel: z.number().int().min(0).default(0),
  expiryDate: dateString.optional(),
  supplier: z.string().trim().optional(),
});

export const updateMedicineSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  category: z.enum(MEDICINE_CATEGORIES, { message: "Invalid category" }).optional(),
  unitPrice: z.number().positive("Unit price must be positive").optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative").optional(),
  reorderLevel: z.number().int().min(0).optional(),
  expiryDate: dateString.optional(),
  supplier: z.string().trim().optional(),
});
