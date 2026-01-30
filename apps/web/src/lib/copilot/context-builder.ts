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
  
  // Calcular metricas
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
  
  let prompt = `Voce e o GoHire Copilot, um assistente de carreira que ajuda 
usuarios a tomar decisoes sobre sua busca de emprego.

CONTEXTO DO USUARIO:
${contextStr}`

  // Add insight context if available
  if (insightContext) {
    prompt += `

CONTEXTO DO INSIGHT ATUAL:
O usuario gerou um insight sobre "${insightContext.cargo}" com a recomendacao: "${insightContext.recommendation}".
${insightContext.next_steps.length > 0 ? `Proximos passos sugeridos: ${insightContext.next_steps.join(', ')}.` : ''}

Ajude o usuario a aprofundar este tema e tomar uma decisao.`
  }

  // Add interview context if available (mock interview feedback)
  if (interviewContext) {
    prompt += `

CONTEXTO DA ENTREVISTA SIMULADA:
O usuario acabou de fazer uma entrevista simulada (mock interview) e esta analisando o feedback.

Detalhes da entrevista:
- Cargo: ${interviewContext.cargo}${interviewContext.area ? ` (${interviewContext.area})` : ''}
- Score: ${interviewContext.score}/100
- Resumo: ${interviewContext.summary}
- Pontos fortes: ${interviewContext.strengths.join(', ')}
- O que melhorar: ${interviewContext.improvements.join(', ')}
- Dicas: ${interviewContext.tips.join(', ')}

IMPORTANTE: Ajude o usuario a melhorar suas habilidades de entrevista baseado neste feedback especifico.
Seja encorajador mas pratico. Ofereca exemplos concretos e tecnicas como o metodo STAR.`
  }

  // Add hero context if available (dica do dia ou contexto especifico)
  if (heroContext) {
    const heroContextLabels: Record<string, string> = {
      pending_insight: 'O usuario tem um insight pendente para revisar',
      proposal_received: `O usuario recebeu uma proposta${heroContext.company ? ` da ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_soon: `O usuario tem uma entrevista${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_feedback: `O usuario completou uma entrevista simulada`,
      needs_followup: `A aplicacao${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''} precisa de follow-up`,
      stale_apps: 'O usuario tem varias aplicacoes sem atualizacao',
      low_activity: 'O usuario esta com baixa atividade de aplicacoes',
      new_user: 'O usuario e novo na plataforma',
      active_summary: 'O usuario esta vendo a dica do dia',
    }
    
    prompt += `

CONTEXTO DA CONVERSA:
${heroContextLabels[heroContext.context] || 'O usuario iniciou uma conversa a partir do dashboard'}

A DICA QUE O USUARIO ESTA VENDO E:
"${heroContext.message}"

IMPORTANTE: O usuario clicou em "Conversar" a partir desta dica. Quando ele perguntar sobre "a dica", "essa dica", "isso", etc., 
ele esta se referindo EXATAMENTE a esta mensagem acima. Ajude-o a aprofundar este tema especifico.`
  }

  prompt += `

DIRETRIZES:
1. Sempre baseie suas respostas nos dados reais do usuario
2. Seja direto e objetivo - evite respostas genericas
3. Quando apropriado, sugira acoes concretas
4. Use um tom amigavel mas profissional
5. Se nao tiver dados suficientes, diga isso claramente
6. Responda sempre em portugues brasileiro

FORMATO DE RESPOSTA:
- Use paragrafos curtos
- Destaque numeros e metricas importantes com **negrito**
- Inclua proximos passos quando relevante
- Evite listas muito longas`

  return prompt
}

function formatContextForPrompt(ctx: UserContext): string {
  let prompt = `- Total de aplicacoes: ${ctx.profile.totalApplications}
- Taxa de conversao: ${ctx.metrics.taxaConversao}% (entrevistas/total)
- Processos ativos: ${ctx.metrics.processosAtivos}
- Aguardando resposta: ${ctx.metrics.aguardandoResposta} aplicacoes
- Ofertas: ${ctx.metrics.ofertas}
- Rejeicoes: ${ctx.metrics.rejeicoes}`

  if (ctx.pendingApplications.length > 0) {
    const oldest = ctx.pendingApplications[0]
    prompt += `\n- Aplicacao mais antiga sem resposta: ${oldest.company} (${oldest.daysSinceApplied} dias)`
  }
  
  if (ctx.careerContext) {
    prompt += `

PERFIL DE CARREIRA:
- Cargo atual: ${ctx.careerContext.cargo}
- Senioridade: ${ctx.careerContext.senioridade}
- Area: ${ctx.careerContext.area}
- Objetivo: ${ctx.careerContext.objetivo}`
  }
  
  if (ctx.insights.length > 0) {
    prompt += `

HISTORICO DE INSIGHTS:`
    
    ctx.insights.slice(0, 3).forEach((insight, i) => {
      prompt += `

[Insight ${i + 1} - ${insight.createdAt}]
- Recomendacao: "${insight.recommendation}"
- Motivos: ${insight.why.join('; ')}
- Riscos: ${insight.risks.join('; ')}
- Proximos passos: ${insight.nextSteps.join('; ')}`
    })
  }
  
  if (ctx.recentApplications.length > 0) {
    prompt += `

APLICACOES RECENTES:`
    ctx.recentApplications.slice(0, 5).forEach(app => {
      prompt += `\n- ${app.company} (${app.title}) - ${app.status} - ${app.daysSinceApplied} dias`
    })
  }

  // Interview history (Interview Pro)
  if (ctx.interviewHistory && ctx.interviewHistory.totalSessions > 0) {
    const ih = ctx.interviewHistory
    prompt += `

HISTORICO DE ENTREVISTAS SIMULADAS (Interview Pro):
- Total de treinos: ${ih.totalSessions}
- Score medio: ${ih.averageScore || 'N/A'}/100
- Ultimo score: ${ih.lastScore || 'N/A'}/100`

    if (ih.recentSessions.length > 0) {
      prompt += `
- Sessoes recentes:`
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
