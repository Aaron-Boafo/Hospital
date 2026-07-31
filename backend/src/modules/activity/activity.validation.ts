import { z } from "zod";
import { ACTIVITY_TYPES } from "./activity.constants.js";

export const createActivitySchema = z.object({
  text: z.string().trim().min(1, "Activity text is required").max(500),
  type: z.enum(ACTIVITY_TYPES).default("ACCENT"),
});
