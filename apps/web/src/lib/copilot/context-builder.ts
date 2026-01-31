import type { UserContext, InsightContextData, HeroContextData, InterviewContextData, InterviewHistoryData } from './types'
import type { Application } from '@/lib/types/application'

interface InsightFromDB {
  id: string
  recommendation: string
  why: string[] | unknown
  risks: string[] | unknown
  next_steps: string[] | unknown
  objetivo: string
  cargo: string
  senioridade: string
  area: string
  status: string
  created_at: string
}

function daysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return []
}

export function buildUserContext(
  applications: Application[] | null,
  insights: InsightFromDB[] | null
): UserContext {
  const apps = applications ?? []
  const insightsList = insights ?? []
  
  // Calcular métricas
  const total = apps.length
  const entrevistas = apps.filter(a => a.status === 'entrevista').length
  const propostas = apps.filter(a => a.status === 'proposta').length
  const rejeicoes = apps.filter(a => a.status === 'rejeitado').length
  const aplicados = apps.filter(a => a.status === 'aplicado').length
  const emAnalise = apps.filter(a => a.status === 'em_analise').length
  
  // Aplicacoes pendentes (aguardando resposta)
  const pendingStatuses = ['aplicado', 'em_analise']
  const pendingApps = apps
    .filter(a => pendingStatuses.includes(a.status))
    .map(a => ({
      company: a.company,
      title: a.title,
      daysSinceApplied: daysSince(a.created_at)
    }))
    .sort((a, b) => b.daysSinceApplied - a.daysSinceApplied)
  
  // Aplicacoes recentes
  const recentApps = apps
    .slice(0, 10)
    .map(a => ({
      company: a.company,
      title: a.title,
      status: a.status,
      appliedAt: formatDate(a.created_at),
      daysSinceApplied: daysSince(a.created_at)
    }))
  
  // Processar insights
  const processedInsights = insightsList.map(insight => ({
    id: insight.id,
    recommendation: insight.recommendation,
    why: ensureStringArray(insight.why),
    risks: ensureStringArray(insight.risks),
    nextSteps: ensureStringArray(insight.next_steps),
    objetivo: insight.objetivo,
    createdAt: formatDate(insight.created_at)
  }))
  
  // Contexto de carreira do ultimo insight
  const lastInsight = insightsList[0]
  const careerContext = lastInsight ? {
    cargo: lastInsight.cargo,
    senioridade: lastInsight.senioridade,
    area: lastInsight.area,
    status: lastInsight.status,
    objetivo: lastInsight.objetivo
  } : null
  
  // Encontrar primeira e ultima atividade
  const dates = apps.map(a => new Date(a.created_at).getTime())
  const activeSince = dates.length > 0 
    ? formatDate(new Date(Math.min(...dates)).toISOString())
    : ''
  const lastActivity = dates.length > 0
    ? formatDate(new Date(Math.max(...dates)).toISOString())
    : ''

  return {
    profile: {
      totalApplications: total,
      activeSince,
      lastActivity
    },
    metrics: {
      taxaConversao: total > 0 ? Math.round((entrevistas / total) * 100) : 0,
      processosAtivos: entrevistas + propostas,
      aguardandoResposta: aplicados + emAnalise,
      ofertas: propostas,
      rejeicoes
    },
    recentApplications: recentApps,
    pendingApplications: pendingApps,
    insights: processedInsights,
    careerContext
  }
}

export function buildSystemPrompt(
  context: UserContext, 
  insightContext?: InsightContextData | null,
  heroContext?: HeroContextData | null,
  interviewContext?: InterviewContextData | null
): string {
  const contextStr = formatContextForPrompt(context)
  
  let prompt = `Você é o GoHire Copilot, um assistente de carreira que ajuda 
usuários a tomar decisões sobre sua busca de emprego.

CONTEXTO DO USUÁRIO:
${contextStr}`

  // Add insight context if available
  if (insightContext) {
    prompt += `

CONTEXTO DO INSIGHT ATUAL:
O usuário gerou um insight sobre "${insightContext.cargo}" com a recomendação: "${insightContext.recommendation}".
${insightContext.next_steps.length > 0 ? `Próximos passos sugeridos: ${insightContext.next_steps.join(', ')}.` : ''}

Ajude o usuário a aprofundar este tema e tomar uma decisão.`
  }

  // Add interview context if available (mock interview feedback)
  if (interviewContext) {
    prompt += `

CONTEXTO DA ENTREVISTA SIMULADA:
O usuário acabou de fazer uma entrevista simulada (mock interview) e está analisando o feedback.

Detalhes da entrevista:
- Cargo: ${interviewContext.cargo}${interviewContext.area ? ` (${interviewContext.area})` : ''}
- Score: ${interviewContext.score}/100
- Resumo: ${interviewContext.summary}
- Pontos fortes: ${interviewContext.strengths.join(', ')}
- O que melhorar: ${interviewContext.improvements.join(', ')}
- Dicas: ${interviewContext.tips.join(', ')}

IMPORTANTE: Ajude o usuário a melhorar suas habilidades de entrevista baseado neste feedback específico.
Seja encorajador mas prático. Ofereça exemplos concretos e técnicas como o método STAR.`
  }

  // Add hero context if available (dica do dia ou contexto específico)
  if (heroContext) {
    const heroContextLabels: Record<string, string> = {
      pending_insight: 'O usuário tem um insight pendente para revisar',
      proposal_received: `O usuário recebeu uma proposta${heroContext.company ? ` da ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_soon: `O usuário tem uma entrevista${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_feedback: `O usuário completou uma entrevista simulada`,
      needs_followup: `A aplicação${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''} precisa de follow-up`,
      stale_apps: 'O usuário tem várias aplicações sem atualização',
      low_activity: 'O usuário está com baixa atividade de aplicações',
      new_user: 'O usuário é novo na plataforma',
      active_summary: 'O usuário está vendo a dica do dia',
    }
    
    prompt += `

CONTEXTO DA CONVERSA:
${heroContextLabels[heroContext.context] || 'O usuário iniciou uma conversa a partir do dashboard'}

A DICA QUE O USUÁRIO ESTÁ VENDO É:
"${heroContext.message}"

IMPORTANTE: O usuário clicou em "Conversar" a partir desta dica. Quando ele perguntar sobre "a dica", "essa dica", "isso", etc., 
ele está se referindo EXATAMENTE a esta mensagem acima. Ajude-o a aprofundar este tema específico.`
  }

  prompt += `

DIRETRIZES:
1. Sempre baseie suas respostas nos dados reais do usuário
2. Seja direto e objetivo - evite respostas genéricas
3. Quando apropriado, sugira ações concretas
4. Use um tom amigável mas profissional
5. Se não tiver dados suficientes, diga isso claramente
6. Responda sempre em português brasileiro

FORMATO DE RESPOSTA:
- Use parágrafos curtos
- Destaque números e métricas importantes com **negrito**
- Inclua próximos passos quando relevante
- Evite listas muito longas`

  return prompt
}

function formatContextForPrompt(ctx: UserContext): string {
  let prompt = `- Total de aplicações: ${ctx.profile.totalApplications}
- Taxa de conversão: ${ctx.metrics.taxaConversao}% (entrevistas/total)
- Processos ativos: ${ctx.metrics.processosAtivos}
- Aguardando resposta: ${ctx.metrics.aguardandoResposta} aplicações
- Ofertas: ${ctx.metrics.ofertas}
- Rejeições: ${ctx.metrics.rejeicoes}`

  if (ctx.pendingApplications.length > 0) {
    const oldest = ctx.pendingApplications[0]
    prompt += `\n- Aplicação mais antiga sem resposta: ${oldest.company} (${oldest.daysSinceApplied} dias)`
  }
  
  if (ctx.careerContext) {
    prompt += `

PERFIL DE CARREIRA:
- Cargo atual: ${ctx.careerContext.cargo}
- Senioridade: ${ctx.careerContext.senioridade}
- Área: ${ctx.careerContext.area}
- Objetivo: ${ctx.careerContext.objetivo}`
  }
  
  if (ctx.insights.length > 0) {
    prompt += `

HISTÓRICO DE INSIGHTS:`
    
    ctx.insights.slice(0, 3).forEach((insight, i) => {
      prompt += `

[Insight ${i + 1} - ${insight.createdAt}]
- Recomendação: "${insight.recommendation}"
- Motivos: ${insight.why.join('; ')}
- Riscos: ${insight.risks.join('; ')}
- Próximos passos: ${insight.nextSteps.join('; ')}`
    })
  }
  
  if (ctx.recentApplications.length > 0) {
    prompt += `

APLICAÇÕES RECENTES:`
    ctx.recentApplications.slice(0, 5).forEach(app => {
      prompt += `\n- ${app.company} (${app.title}) - ${app.status} - ${app.daysSinceApplied} dias`
    })
  }

  // Interview history (Interview Pro)
  if (ctx.interviewHistory && ctx.interviewHistory.totalSessions > 0) {
    const ih = ctx.interviewHistory
    prompt += `

HISTÓRICO DE ENTREVISTAS SIMULADAS (Interview Pro):
- Total de treinos: ${ih.totalSessions}
- Score médio: ${ih.averageScore || 'N/A'}/100
- Último score: ${ih.lastScore || 'N/A'}/100`

    if (ih.recentSessions.length > 0) {
      prompt += `
- Sessões recentes:`
      ih.recentSessions.slice(0, 3).forEach(session => {
        prompt += `
  * ${session.cargo} - ${session.score}/100 (${session.completedAt})`
        if (session.mainStrengths.length > 0) {
          prompt += `
    Pontos fortes: ${session.mainStrengths.join(', ')}`
        }
        if (session.mainImprovements.length > 0) {
          prompt += `
    Melhorar: ${session.mainImprovements.join(', ')}`
        }
      })
    }
  }

  return prompt
}
