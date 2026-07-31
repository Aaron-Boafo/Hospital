import { useMutation } from '@tanstack/react-query'
import { askAiAgent } from '../services/ai-agent'
import type { AiAgentChatInput } from '../types'

export function useChatWithAiAgent() {
  return useMutation({
    mutationFn: (input: AiAgentChatInput) => askAiAgent(input),
  })
}
