import type { UserContext } from './types'
import { findMatchingHandler } from './direct-handlers'

export type QueryType = 'direct' | 'ai'

export interface DirectQueryResult {
  type: 'direct'
  response: string
}

export interface AIQueryResult {
  type: 'ai'
  context: UserContext
  question: string
}

export type QueryResult = DirectQueryResult | AIQueryResult

// Keywords que indicam query direta (resposta do DB sem IA)
const directKeywords = [
  'taxa de conversao',
  'taxa de conversão',
  'quantas candidaturas',
  'quantas entrevistas',
  'ultimo insight',
  'último insight',
  'suas recomendacoes',
  'suas recomendações',
  'riscos identificou',
  'proximos passos sugeriu',
  'próximos passos sugeriu',
  'aguardando resposta',
  'empresa mais antiga',
]

export function classifyQuery(question: string): QueryType {
  const normalized = question.toLowerCase()
  
  for (const keyword of directKeywords) {
    if (normalized.includes(keyword)) {
      return 'direct'
    }
  }
  
  return 'ai'
}

export function handleQuery(
  question: string,
  ctx: UserContext
): QueryResult {
  const queryType = classifyQuery(question)
  
  if (queryType === 'direct') {
    const handler = findMatchingHandler(question)
    if (handler) {
      return {
        type: 'direct',
        response: handler(ctx),
      }
    }
  }
  
  // Fallback para IA
  return {
    type: 'ai',
    context: ctx,
    question,
  }
}
