import type { CopilotCTA, UserContext } from './types'

interface CTADetectorInput {
  question: string
  userContext: UserContext
  hasInterviewContext: boolean
  hasInsightContext: boolean
}

// Keywords que trigam cada CTA
const INTERVIEW_KEYWORDS = [
  'entrevista',
  'nervoso',
  'nervosa',
  'ansioso',
  'ansiosa',
  'como responder',
  'perguntas',
  'preparar entrevista',
  'mock',
  'simulacao',
  'simulação',
  'treinar',
  'praticar',
  'me preparar',
  'dicas de entrevista',
]

const INSIGHT_KEYWORDS = [
  'momento',
  'direcao',
  'direção',
  'o que fazer',
  'proximo passo',
  'próximo passo',
  'carreira',
  'rumo',
  'caminho',
  'decidir',
  'escolher',
  'transicao',
  'transição',
  'mudar de area',
  'mudar de área',
]

const APPLICATION_KEYWORDS = [
  'metrica',
  'métrica',
  'taxa',
  'conversao',
  'conversão',
  'estatistica',
  'estatística',
  'dados',
  'numeros',
  'números',
  'desempenho',
  'performance',
]

/**
 * Verifica se a pergunta contem alguma das keywords
 */
function containsKeyword(question: string, keywords: string[]): boolean {
  const normalizedQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  return keywords.some(keyword => {
    const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return normalizedQuestion.includes(normalizedKeyword)
  })
}

/**
 * Verifica se o usuario tem insight recente (ultimos 30 dias)
 */
function hasRecentInsight(userContext: UserContext): boolean {
  if (!userContext.insights || userContext.insights.length === 0) {
    return false
  }
  
  const latestInsight = userContext.insights[0]
  const insightDate = new Date(latestInsight.createdAt)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return insightDate > thirtyDaysAgo
}

/**
 * Verifica se o usuário tem algum insight (não apenas recente)
 */
function hasAnyInsight(userContext: UserContext): boolean {
  return userContext.insights && userContext.insights.length > 0
}

/**
 * Detecta se a pergunta do usuário deveria mostrar um CTA contextual
 * Retorna null se nenhum CTA for pertinente
 * 
 * PRIORIDADE:
 * 1. Insight - se usuário não tem nenhuma análise (prioridade máxima)
 * 2. Entrevista IA - se conversa é sobre preparação
 * 3. Adicionar Vaga - se conversa é sobre tracking
 */
export function detectCTA(input: CTADetectorInput): CopilotCTA | null {
  const { question, userContext, hasInterviewContext, hasInsightContext } = input
  
  // PRIORIDADE 1: CTA Gerar Insight
  // Condição: Usuário NÃO tem NENHUM insight (prioridade máxima)
  // Ou fala de direção/momento e NÃO tem insight recente
  if (!hasAnyInsight(userContext) && !hasInsightContext) {
    return {
      type: 'insight',
      label: 'Criar sua estratégia de carreira',
      href: '/comecar',
      icon: 'sparkles',
    }
  }
  
  // CTA Gerar Insight quando fala de direção mas não tem insight recente
  if (containsKeyword(question, INSIGHT_KEYWORDS) && !hasInsightContext && !hasRecentInsight(userContext)) {
    return {
      type: 'insight',
      label: 'Atualizar sua estratégia',
      href: '/comecar',
      icon: 'sparkles',
    }
  }
  
  // PRIORIDADE 2: CTA Entrevista IA
  // Condição: Fala de entrevista e NÃO está no contexto de entrevista
  if (containsKeyword(question, INTERVIEW_KEYWORDS) && !hasInterviewContext) {
    return {
      type: 'interview_pro',
      label: 'Treinar com Entrevista IA',
      href: '/dashboard/interview-pro',
      icon: 'video',
    }
  }
  
  // PRIORIDADE 3: CTA Adicionar Vaga
  // Condição: Fala de métricas mas tem poucas candidaturas (menos de 3)
  if (containsKeyword(question, APPLICATION_KEYWORDS) && userContext.profile.totalApplications < 3) {
    return {
      type: 'add_application',
      label: 'Adicionar vaga',
      href: '/dashboard/aplicacoes/nova',
      icon: 'plus',
    }
  }
  
  // CTA Entrevista IA por taxa baixa
  // Condição: Taxa de conversão abaixo de 10% e tem pelo menos 5 candidaturas
  if (
    containsKeyword(question, APPLICATION_KEYWORDS) &&
    userContext.metrics.taxaConversao < 10 &&
    userContext.profile.totalApplications >= 5 &&
    !hasInterviewContext
  ) {
    return {
      type: 'interview_pro',
      label: 'Melhorar em entrevistas',
      href: '/dashboard/interview-pro',
      icon: 'video',
    }
  }
  
  return null
}
