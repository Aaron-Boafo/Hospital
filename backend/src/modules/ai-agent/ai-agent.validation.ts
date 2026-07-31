import { z } from "zod";

export const aiAgentChatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000),
});
