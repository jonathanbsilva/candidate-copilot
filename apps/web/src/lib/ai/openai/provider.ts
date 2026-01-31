import type { AIMessage, AIResponse, AIStreamChunk, AIConfig } from '../types'
import type { AIProvider } from '../provider'
import { getOpenAIClient } from './client'

const DEFAULT_CONFIG: AIConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 1000,
}

export class OpenAIProvider implements AIProvider {
  async complete(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse> {
    const client = getOpenAIClient()
    const finalConfig = { ...DEFAULT_CONFIG, ...config }

    const response = await client.chat.completions.create({
      model: finalConfig.model,
      messages,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.max_tokens,
    })

    return {
      content: response.choices[0]?.message?.content || '',
      model: finalConfig.model,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    }
  }

  async *stream(messages: AIMessage[], config?: Partial<AIConfig>): AsyncIterable<AIStreamChunk> {
    const client = getOpenAIClient()
    const finalConfig = { ...DEFAULT_CONFIG, ...config }

    const stream = await client.chat.completions.create({
      model: finalConfig.model,
      messages,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.max_tokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      const done = chunk.choices[0]?.finish_reason === 'stop'
      yield { content, done }
    }
  }
}
