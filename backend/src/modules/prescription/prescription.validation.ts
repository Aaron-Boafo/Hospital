import { z } from "zod";

export const createPrescriptionSchema = z.object({
  patientId: z.uuid("Invalid patient id"),
  doctorName: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        medicineId: z.uuid("Invalid medicine id"),
        dosage: z.string().trim().min(1, "Dosage is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        frequency: z.string().trim().optional(),
        duration: z.string().trim().optional(),
      }),
    )
    .min(1, "At least one item is required"),
});
