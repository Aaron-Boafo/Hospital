import { z } from "zod";
import { DEPARTMENTS } from "./doctor.constants.js";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  department: z.enum(DEPARTMENTS, { message: "Invalid department" }),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email").optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();
