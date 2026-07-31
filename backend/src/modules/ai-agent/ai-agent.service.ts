import { agent } from "@/shared/config/openAi.js";
import type {
  AiAgentChatInput,
  AiAgentChatResponse,
} from "./ai-agent.types.js";

function normalizeReply(response: unknown): string {
  if (typeof response === "string") return response;

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (typeof record.output === "string") return record.output;
    if (typeof record.content === "string") return record.content;
    if (typeof record.result === "string") return record.result;
    if (Array.isArray(record.content)) {
      return record.content
        .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
        .join("\n");
    }

    return JSON.stringify(response);
  }

  return String(response ?? "");
}

export async function askAiAgent(
  input: AiAgentChatInput,
): Promise<AiAgentChatResponse> {
  const response = await (
    agent as { invoke: (payload: unknown) => Promise<unknown> }
  ).invoke({
    input: input.message,
  });

  return { reply: normalizeReply(response) };
}
