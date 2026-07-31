import { asyncHandler } from "@/shared/utils/index.js";
import { askAiAgent } from "./ai-agent.service.js";
import { aiAgentChatSchema } from "./ai-agent.validation.js";

export const chatWithAiAgent = asyncHandler(async (req, res) => {
  const input = aiAgentChatSchema.parse(req.body);
  const result = await askAiAgent(input);
  res.json(result);
});
