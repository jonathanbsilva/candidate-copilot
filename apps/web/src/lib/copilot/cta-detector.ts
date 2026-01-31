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
 * Detecta se a pergunta do usuario deveria mostrar um CTA contextual
 * Retorna null se nenhum CTA for pertinente
 */
export function detectCTA(input: CTADetectorInput): CopilotCTA | null {
  const { question, userContext, hasInterviewContext, hasInsightContext } = input
  
  // CTA Entrevista IA
  // Condicao: Fala de entrevista e NAO esta no contexto de entrevista
  if (containsKeyword(question, INTERVIEW_KEYWORDS) && !hasInterviewContext) {
    return {
      type: 'interview_pro',
      label: 'Treinar com Entrevista IA',
      href: '/dashboard/interview-pro',
      icon: 'video',
    }
  }
  
  // CTA Gerar Insight
  // Condicao: Fala de direcao/momento e NAO tem insight recente
  if (containsKeyword(question, INSIGHT_KEYWORDS) && !hasInsightContext && !hasRecentInsight(userContext)) {
    return {
      type: 'insight',
      label: 'Gerar novo insight',
      href: '/comecar',
      icon: 'sparkles',
    }
  }
  
  // CTA Adicionar Vaga
  // Condicao: Fala de metricas mas tem poucas aplicacoes (menos de 3)
  if (containsKeyword(question, APPLICATION_KEYWORDS) && userContext.profile.totalApplications < 3) {
    return {
      type: 'add_application',
      label: 'Adicionar vaga',
      href: '/dashboard/aplicacoes/nova',
      icon: 'plus',
    }
  }
  
  // CTA Entrevista IA por taxa baixa
  // Condicao: Taxa de conversao abaixo de 10% e tem pelo menos 5 aplicacoes
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
