import { request } from '../api/client'
import type { AiAgentChatInput, AiAgentChatResponse } from '../types'

export function askAiAgent(input: AiAgentChatInput): Promise<AiAgentChatResponse> {
  return request.post<AiAgentChatResponse>('/ai-agent/chat', input)
}
