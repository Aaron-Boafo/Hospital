import { z } from "zod";

export const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
