import { z } from "zod";
import { PAYMENT_METHODS } from "./bill.constants.js";

export const createBillSchema = z.object({
  patientId: z.uuid("Invalid patient id"),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1, "Item description is required"),
        amount: z.number().positive("Amount must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(PAYMENT_METHODS),
});
