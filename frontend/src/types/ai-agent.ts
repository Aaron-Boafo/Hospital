export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AiAgentChatInput {
  message: string
  history?: Message[]
}

export interface AiAgentChatResponse {
  reply: string
}

