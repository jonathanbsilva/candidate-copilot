import type { UserContext, InsightContextData, HeroContextData, InterviewContextData, InterviewHistoryData, BenchmarkContextData, ApplicationContextData } from './types'
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
  interviewContext?: InterviewContextData | null,
  benchmarkContext?: BenchmarkContextData | null,
  applicationContext?: ApplicationContextData | null
): string {
  const contextStr = formatContextForPrompt(context)
  
  let prompt = `Você é o GoHire Copilot, um assistente que ajuda profissionais 
a tomar decisões de carreira com clareza.

Seu papel é ajudar o usuário a entender sua situação atual, 
identificar padrões e tomar ações concretas baseadas no 
objetivo de carreira dele.

CONTEXTO DO USUÁRIO:
${contextStr}`

  // Add insight context if available (enhanced for V1.1)
  if (insightContext) {
    const isV2 = !!insightContext.diagnosis
    
    prompt += `

===== CONTEXTO DO INSIGHT (IMPORTANTE) =====

O usuário está conversando sobre uma ANÁLISE DE CARREIRA que ele acabou de gerar.

PERFIL DO USUÁRIO:
- Cargo: ${insightContext.cargo}
${insightContext.senioridade ? `- Senioridade: ${insightContext.senioridade}` : ''}
${insightContext.area ? `- Área: ${insightContext.area}` : ''}
${insightContext.status ? `- Status: ${insightContext.status}` : ''}
${insightContext.objetivo ? `- Objetivo principal: ${insightContext.objetivo}` : ''}
${insightContext.urgencia ? `- Urgência: ${insightContext.urgencia}/5` : ''}
${insightContext.tempoSituacao ? `- Tempo nessa situação: ${insightContext.tempoSituacao}` : ''}`

    // Add V1.1 contextual data if available
    if (insightContext.decisionBlocker) {
      prompt += `\n- O que trava a decisão: ${insightContext.decisionBlocker}`
    }
    if (insightContext.interviewBottleneck) {
      prompt += `\n- Onde trava nas entrevistas: ${insightContext.interviewBottleneck}`
    }
    if (insightContext.maxStage) {
      prompt += `\n- Fase máxima que costuma chegar: ${insightContext.maxStage}`
    }
    if (insightContext.leverageSignals) {
      prompt += `\n- Sinal de alavanca para negociação: ${insightContext.leverageSignals}`
    }
    if (insightContext.pivotType) {
      prompt += `\n- Tipo de mudança desejada: ${insightContext.pivotType}`
    }
    if (insightContext.transferableStrengths) {
      prompt += `\n- Forças transferíveis: ${insightContext.transferableStrengths}`
    }
    if (insightContext.avoidedDecision) {
      prompt += `\n- Decisão que está evitando: ${insightContext.avoidedDecision}`
    }

    if (isV2) {
      // V1.1 diagnostic insight
      prompt += `

DIAGNÓSTICO GERADO:
${insightContext.typeLabel ? `- Tipo: ${insightContext.typeLabel}` : ''}
- Situação atual: ${insightContext.diagnosis}
${insightContext.pattern ? `- Padrão observado: ${insightContext.pattern}` : ''}
${insightContext.risk ? `- Risco identificado: ${insightContext.risk}` : ''}
${insightContext.nextStep ? `- Próximo passo sugerido: ${insightContext.nextStep}` : ''}`
    } else if (insightContext.recommendation) {
      // V1 legacy insight
      prompt += `

ANÁLISE GERADA:
- Recomendação: ${insightContext.recommendation}
${insightContext.next_steps && insightContext.next_steps.length > 0 ? `- Próximos passos: ${insightContext.next_steps.join('; ')}` : ''}`
    }

    prompt += `

COMO AJUDAR O USUÁRIO:
1. SEJA CONVERSACIONAL: O usuário quer DISCUTIR a análise, não receber mais uma análise genérica
2. FAÇA PERGUNTAS: Se precisar de mais contexto para ajudar, pergunte! Ex: "Você já tentou X?", "O que te impede de Y?"
3. SEJA ESPECÍFICO: Use os dados dele (cargo, área, situação) para dar conselhos práticos
4. AJUDE NA DECISÃO: O objetivo é ajudá-lo a tomar uma DECISÃO ou AÇÃO concreta
5. SEJA HONESTO: Se o caminho dele parece arriscado, diga isso de forma construtiva
6. EXPLORE ALTERNATIVAS: Ajude a ver ângulos que ele pode não ter considerado

EXEMPLOS DE BOAS RESPOSTAS:
- "Você mencionou que trava na fase técnica. Que tipo de feedback você costuma receber?"
- "Com seu perfil de X anos como ${insightContext.cargo}, você já considerou aplicar para Y?"
- "O risco que identifiquei é Z. O que você acha? Faz sentido no seu contexto?"

NÃO FAÇA:
- Repetir o diagnóstico que já foi mostrado
- Dar conselhos genéricos de coaching
- Ser condescendente ou excessivamente positivo
- Evitar perguntas por medo de parecer invasivo`
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
      pending_insight: 'O usuário tem uma análise pendente para revisar',
      proposal_received: `O usuário recebeu uma proposta${heroContext.company ? ` da ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_soon: `O usuário tem uma entrevista${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''}`,
      interview_feedback: `O usuário completou uma entrevista simulada`,
      needs_followup: `A candidatura${heroContext.company ? ` na ${heroContext.company}` : ''}${heroContext.title ? ` para ${heroContext.title}` : ''} precisa de follow-up`,
      stale_apps: 'O usuário tem várias candidaturas sem atualização',
      low_activity: 'O usuário está com baixa atividade de candidaturas',
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

  // Add benchmark context if available
  if (benchmarkContext) {
    const positionText = benchmarkContext.isAbove 
      ? `**${Math.abs(benchmarkContext.diff)}% acima** da média da plataforma`
      : benchmarkContext.diff === 0
      ? 'na **média** da plataforma'
      : `**${Math.abs(benchmarkContext.diff)}% abaixo** da média da plataforma`
    
    const percentilText = benchmarkContext.percentil > 0
      ? `Isso coloca o usuário no **top ${100 - benchmarkContext.percentil}%** dos usuários.`
      : ''

    prompt += `

CONTEXTO DE BENCHMARK (Comparação com outros usuários):
O usuário está analisando como sua taxa de conversão se compara com outros usuários da plataforma.

Dados do benchmark:
- Taxa de conversão do usuário: **${benchmarkContext.userTaxa}%**
- Média da plataforma: **${benchmarkContext.mediaTaxa}%**
- Diferença: ${positionText}
${percentilText}
- Base de comparação: ${benchmarkContext.totalUsuarios} usuários ativos

IMPORTANTE: 
- O usuário quer entender o que essa comparação significa para sua busca de emprego
- Se estiver acima da média, parabenize e sugira como manter/melhorar
- Se estiver abaixo, seja encorajador e ofereça dicas práticas para melhorar
- Explique que taxa de conversão é a % de candidaturas que avançam para entrevistas
- Sugira ações concretas baseadas na posição do usuário`
  }

  // Add application context if available (proposta, entrevista, etc.)
  if (applicationContext) {
    const statusLabels: Record<string, string> = {
      proposta: 'recebeu uma proposta',
      entrevista: 'tem uma entrevista marcada',
      aplicado: 'aplicou recentemente',
      em_analise: 'está em análise',
      aceito: 'foi aceito',
      rejeitado: 'foi rejeitado',
      desistencia: 'desistiu',
    }
    
    const statusContext = statusLabels[applicationContext.status] || applicationContext.status
    
    prompt += `

CONTEXTO DA VAGA (IMPORTANTE):
O usuário está conversando sobre uma vaga específica onde ele ${statusContext}.

DETALHES DA VAGA:
- Empresa: ${applicationContext.company}
- Cargo: ${applicationContext.title}
- Status atual: ${applicationContext.status}
${applicationContext.location ? `- Localização: ${applicationContext.location}` : ''}
${applicationContext.salaryRange ? `- Faixa salarial: ${applicationContext.salaryRange}` : ''}
${applicationContext.jobDescription ? `- Descrição: ${applicationContext.jobDescription.substring(0, 300)}${applicationContext.jobDescription.length > 300 ? '...' : ''}` : ''}
${applicationContext.notes ? `
NOTAS DO USUÁRIO (importante - pode conter informações relevantes como salário, benefícios, dúvidas):
"${applicationContext.notes}"` : ''}`

    // Diretrizes específicas para proposta
    if (applicationContext.status === 'proposta') {
      prompt += `

VOCÊ ESTÁ AJUDANDO A AVALIAR UMA PROPOSTA:
1. Se o usuário mencionou salário nas notas, use esse valor na análise
2. Ajude a comparar a proposta com o mercado (se souber o cargo/senioridade)
3. Sugira perguntas importantes antes de aceitar (benefícios, cultura, crescimento)
4. Ajude a identificar red flags ou pontos positivos
5. Se ele quiser negociar, ajude a estruturar argumentos
6. SEJA DIRETO: ajude na decisão, não fique em cima do muro

PERGUNTAS QUE VOCÊ PODE FAZER:
- "Qual era sua expectativa salarial?"
- "O que mais te atrai além do salário?"
- "Tem algo que te preocupa nessa proposta?"
- "Como isso se compara com sua situação atual?"`
    }
  }

  prompt += `

DIRETRIZES:
1. Foque no OBJETIVO de carreira do usuário - toda resposta deve conectar com isso
2. Use dados de vagas para contextualizar, não como fim em si
3. Ajude o usuário a tomar DECISÕES, não apenas informar métricas
4. Quando apropriado, sugira 1-2 ações concretas (não mais)
5. Se o usuário não tem análise de carreira, sugira fazer uma
6. Responda em português brasileiro, de forma direta

FORMATO DE RESPOSTA:
- MÁXIMO 3 parágrafos curtos por resposta
- Destaque apenas 1-2 números/métricas com **negrito**
- Evite listas longas - se precisar, máximo 3 itens
- Evite introduções genéricas como "Ótima pergunta!" ou "Claro!"`

  return prompt
}

function formatContextForPrompt(ctx: UserContext): string {
  let prompt = ''

  // 1. PERFIL DE CARREIRA (prioridade máxima)
  if (ctx.careerContext) {
    prompt += `PERFIL DE CARREIRA:
- Cargo: ${ctx.careerContext.cargo}
- Senioridade: ${ctx.careerContext.senioridade}
- Área: ${ctx.careerContext.area}
- Objetivo principal: ${ctx.careerContext.objetivo}`
  }
  
  // 2. ÚLTIMA ANÁLISE DE CARREIRA (insight)
  if (ctx.insights.length > 0) {
    const lastInsight = ctx.insights[0]
    prompt += `${prompt ? '\n\n' : ''}ÚLTIMA ANÁLISE DE CARREIRA (${lastInsight.createdAt}):
- Recomendação: "${lastInsight.recommendation}"
${lastInsight.why.length > 0 ? `- Motivos: ${lastInsight.why.join('; ')}` : ''}
${lastInsight.risks.length > 0 ? `- Riscos: ${lastInsight.risks.join('; ')}` : ''}
${lastInsight.nextSteps.length > 0 ? `- Próximos passos: ${lastInsight.nextSteps.join('; ')}` : ''}`
  }

  // 3. CONTEXTO DE VAGAS (secundário, conectado ao objetivo)
  prompt += `${prompt ? '\n\n' : ''}CONTEXTO DE VAGAS (para contextualizar a busca):
- Total de candidaturas: ${ctx.profile.totalApplications}
- Taxa de conversão: ${ctx.metrics.taxaConversao}% (entrevistas/total)
- Processos ativos: ${ctx.metrics.processosAtivos}
- Aguardando resposta: ${ctx.metrics.aguardandoResposta}
- Ofertas: ${ctx.metrics.ofertas}`

  if (ctx.pendingApplications.length > 0) {
    const oldest = ctx.pendingApplications[0]
    prompt += `\n- Candidatura mais antiga sem resposta: ${oldest.company} (${oldest.daysSinceApplied} dias)`
  }
  
  if (ctx.recentApplications.length > 0) {
    prompt += `\n\nAPLICAÇÕES RECENTES:`
    ctx.recentApplications.slice(0, 5).forEach(app => {
      prompt += `\n- ${app.company} (${app.title}) - ${app.status} - ${app.daysSinceApplied} dias`
    })
  }

  // 4. HISTÓRICO DE ENTREVISTAS SIMULADAS
  if (ctx.interviewHistory && ctx.interviewHistory.totalSessions > 0) {
    const ih = ctx.interviewHistory
    prompt += `

HISTÓRICO DE ENTREVISTAS SIMULADAS (Entrevista IA):
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
