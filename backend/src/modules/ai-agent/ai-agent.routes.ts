import { Router } from "express";
import { chatWithAiAgent } from "./ai-agent.controller.js";
import { AI_AGENT_CHAT_ROUTE } from "./ai-agent.constants.js";

const aiAgentRouter = Router();
aiAgentRouter.post(AI_AGENT_CHAT_ROUTE, chatWithAiAgent);

export { aiAgentRouter };
