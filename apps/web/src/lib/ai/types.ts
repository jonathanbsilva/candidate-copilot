export type AIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AIStreamChunk = {
  content: string
  done: boolean
}

export type AIResponse = {
  content: string
  model: AIModel
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export type AIModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo'

export type AIConfig = {
  model: AIModel
  temperature?: number
  max_tokens?: number
  stream?: boolean
}
