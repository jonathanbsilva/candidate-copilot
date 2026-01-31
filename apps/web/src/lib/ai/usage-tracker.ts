/**
 * AI Usage Tracker
 * 
 * Rastreia uso de tokens de IA para controle de custos.
 * 
 * Usage:
 * import { trackAIUsage } from '@/lib/ai/usage-tracker'
 * 
 * // Após chamada de IA
 * await trackAIUsage(userId, 'copilot', 'gpt-4o-mini', {
 *   prompt_tokens: response.usage.prompt_tokens,
 *   completion_tokens: response.usage.completion_tokens,
 * })
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Pricing per 1K tokens (em USD)
// Atualizar quando OpenAI mudar preços
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
}

export type AIFeature = 
  | 'copilot' 
  | 'hero_card' 
  | 'interview_question' 
  | 'interview_feedback' 
  | 'insight'

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
}

/**
 * Rastreia uso de tokens de IA no banco de dados
 * 
 * @param userId - ID do usuário
 * @param feature - Feature que usou a IA
 * @param model - Modelo usado (ex: 'gpt-4o-mini')
 * @param usage - Tokens usados (prompt e completion)
 */
export async function trackAIUsage(
  userId: string,
  feature: AIFeature,
  model: string,
  usage: TokenUsage
): Promise<void> {
  try {
    const pricing = PRICING[model]
    
    // Calcular custo estimado
    let estimatedCost: number | null = null
    if (pricing) {
      estimatedCost = 
        (usage.prompt_tokens / 1000) * pricing.input +
        (usage.completion_tokens / 1000) * pricing.output
    }

    const supabase = await createClient()
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature,
      model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.prompt_tokens + usage.completion_tokens,
      estimated_cost: estimatedCost,
    })

    if (error) {
      // Log mas não falha a operação principal
      logger.warn('Erro ao rastrear uso de IA', {
        error: error.message,
        userId,
        feature,
        model,
      })
    }
  } catch (err) {
    // Silently fail - tracking should not break the main flow
    logger.warn('Exceção ao rastrear uso de IA', {
      error: err instanceof Error ? err.message : 'Unknown error',
      userId,
      feature,
    })
  }
}

/**
 * Retorna estatísticas de uso de IA do usuário
 * Útil para dashboards administrativos
 */
export async function getAIUsageStats(userId: string, days: number = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('feature, total_tokens, estimated_cost')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error || !data) {
    return {
      totalTokens: 0,
      totalCost: 0,
      byFeature: {} as Record<string, { tokens: number; cost: number }>,
    }
  }

  const byFeature: Record<string, { tokens: number; cost: number }> = {}
  let totalTokens = 0
  let totalCost = 0

  for (const row of data) {
    totalTokens += row.total_tokens
    totalCost += Number(row.estimated_cost) || 0

    if (!byFeature[row.feature]) {
      byFeature[row.feature] = { tokens: 0, cost: 0 }
    }
    byFeature[row.feature].tokens += row.total_tokens
    byFeature[row.feature].cost += Number(row.estimated_cost) || 0
  }

  return { totalTokens, totalCost, byFeature }
}
