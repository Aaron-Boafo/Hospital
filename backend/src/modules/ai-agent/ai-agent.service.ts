import { agent } from "@/shared/config/openAi.js";
import type {
  AiAgentChatInput,
  AiAgentChatResponse,
} from "./ai-agent.types.js";

function normalizeReply(response: unknown): string {
  if (typeof response === "string") return response;

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    // Handle langchain agent response containing a messages array
    if (Array.isArray(record.messages) && record.messages.length > 0) {
      const lastMsg = record.messages[record.messages.length - 1];
      if (lastMsg && typeof lastMsg === "object") {
        const msgRecord = lastMsg as Record<string, any>;
        if (msgRecord.kwargs && typeof msgRecord.kwargs.content === "string") {
          return msgRecord.kwargs.content;
        }
        if (typeof msgRecord.content === "string") {
          return msgRecord.content;
        }
      }
    }

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
  const messages = [
    ...(input.history || []).map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
    { role: "user", content: input.message },
  ];

  const response = await (
    agent as { invoke: (payload: unknown) => Promise<unknown> }
  ).invoke({
    messages,
  });

  return { reply: normalizeReply(response) };
}

