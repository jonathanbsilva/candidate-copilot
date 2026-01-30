import { getOpenAIClient } from '@/lib/ai/openai/client'
import type { HeroContext, HeroData, ContextDetectionResult } from './types'

// Cache em memoria para mensagens AI (evita chamadas repetidas)
const messageCache = new Map<string, { data: HeroData; timestamp: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function getCacheKey(context: HeroContext, metadata?: Record<string, unknown>): string {
  // Para contextos com app especifico, usa o app id
  if (metadata?.company) {
    return `${context}_${metadata.company}`
  }
  return context
}

function getCachedMessage(key: string): HeroData | null {
  const cached = messageCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }
  // Limpa cache expirado
  if (cached) {
    messageCache.delete(key)
  }
  return null
}

function setCachedMessage(key: string, data: HeroData): void {
  messageCache.set(key, { data, timestamp: Date.now() })
}

// Dicas rotativas para active_summary (evita chamadas AI desnecessarias)
// Troca a cada 6 horas para manter o conteudo fresco
const tips = [
  // Candidatura
  'Personalize cada candidatura. Recrutadores valorizam quem demonstra interesse genuino pela vaga e empresa.',
  'Adapte seu curriculo para cada vaga, destacando experiencias relevantes para a posicao.',
  'Inclua numeros e resultados no curriculo. "Aumentei vendas em 30%" e mais impactante que "responsavel por vendas".',
  'Envie sua candidatura no inicio da semana. Estudos mostram que vagas recebem mais atencao segunda e terca.',
  
  // LinkedIn e Networking
  'Mantenha seu LinkedIn atualizado. 87% dos recrutadores usam a plataforma para encontrar candidatos.',
  'Aproveite cada oportunidade de networking, mesmo que pareca pequena. Cada conexao pode abrir portas.',
  'Conecte-se com recrutadores das empresas que te interessam. Uma mensagem personalizada pode abrir portas.',
  'Participe de grupos do LinkedIn da sua area. E uma otima forma de ficar por dentro das tendencias.',
  'Peca recomendacoes no LinkedIn para colegas e gestores. Elas aumentam a credibilidade do seu perfil.',
  
  // Entrevistas
  'Prepare-se para entrevistas pesquisando a cultura da empresa. Isso demonstra comprometimento.',
  'Pratique suas respostas para perguntas comportamentais usando o metodo STAR (Situacao, Tarefa, Acao, Resultado).',
  'Prepare perguntas para fazer ao entrevistador. Demonstra interesse e te ajuda a avaliar a empresa.',
  'Vista-se um nivel acima do dress code da empresa. Melhor pecar pelo excesso de formalidade.',
  'Chegue 10-15 minutos antes da entrevista. Pontualidade e basico, mas faz diferenca.',
  
  // Follow-up
  'Faca follow-up educado apos entrevistas. Um email de agradecimento pode fazer a diferenca.',
  'Se nao tiver retorno em 1-2 semanas, envie um follow-up cordial. Demonstra interesse sem ser insistente.',
  'Apos uma rejeicao, peca feedback. Nem todos respondem, mas quando respondem, e ouro.',
  
  // Mindset e estrategia
  'Trate sua busca de emprego como um projeto. Defina metas semanais de aplicacoes e follow-ups.',
  'Nao coloque todos os ovos na mesma cesta. Continue aplicando mesmo quando uma vaga parece promissora.',
  'Rejeicoes fazem parte do processo. Cada "nao" te aproxima do "sim" certo.',
  'Cuide da sua saude mental durante a busca. Pausas e autocuidado nao sao luxo, sao necessidade.',
  'Celebre pequenas vitorias: uma entrevista agendada, um feedback positivo, uma nova conexao.',
  
  // Salario e negociacao
  'Pesquise a faixa salarial do mercado antes de entrevistas. Sites como Glassdoor podem ajudar.',
  'Quando perguntarem sua pretensao salarial, de uma faixa ao inves de um numero fixo.',
  'Considere o pacote total: salario, beneficios, flexibilidade, crescimento. Nem tudo e sobre dinheiro.',
  
  // Desenvolvimento
  'Aprenda uma skill nova enquanto busca emprego. Mostra proatividade e mantem voce atualizado.',
  'Contribua em projetos open source ou crie um portfolio. Evidencias praticas valem mais que palavras.',
  'Mantenha-se ativo na sua area: leia artigos, participe de eventos, faca cursos.',
]

function getRotatingTip(): string {
  // Troca a cada 6 horas (4 periodos por dia)
  const sixHoursMs = 6 * 60 * 60 * 1000
  const periodsSinceEpoch = Math.floor(Date.now() / sixHoursMs)
  return tips[periodsSinceEpoch % tips.length]
}

// Templates estaticos para contextos simples
const templates: Record<string, (metadata?: Record<string, unknown>) => HeroData> = {
  pending_insight: () => ({
    context: 'pending_insight',
    title: '💡 Insight pronto para voce',
    message: 'Voce tem um insight de carreira pendente. Acesse para ver suas recomendacoes personalizadas.',
    primaryCta: { label: 'Ver insight', href: '/dashboard/insights' },
    secondaryCta: { label: 'Tirar duvidas', href: '/dashboard?chat=open' },
  }),

  stale_apps: (metadata) => ({
    context: 'stale_apps',
    title: '⏰ Suas aplicacoes precisam de atencao',
    message: `Voce tem ${metadata?.count || 'varias'} aplicacoes sem atualizacao ha mais de 2 semanas. Que tal revisar o status delas?`,
    primaryCta: { label: 'Ver aplicacoes', href: '/dashboard/aplicacoes' },
    secondaryCta: { label: 'Dicas de follow-up', href: '/dashboard?chat=open&prompt=dicas-followup' },
  }),

  low_activity: (metadata) => ({
    context: 'low_activity',
    title: '🎯 Hora de continuar sua busca',
    message: `Ja faz ${metadata?.daysSinceLastApp || 'alguns'} dias desde sua ultima aplicacao. Manter o ritmo e importante!`,
    primaryCta: { label: 'Adicionar vaga', href: '/dashboard/aplicacoes/nova' },
    secondaryCta: { label: 'Ver vagas salvas', href: '/dashboard/aplicacoes' },
  }),

  new_user: () => ({
    context: 'new_user',
    title: '👋 Bem-vindo ao seu Copilot de carreira',
    message: 'Comece adicionando suas aplicacoes ou gere um insight personalizado sobre sua carreira.',
    primaryCta: { label: 'Gerar insight', href: '/comecar' },
    secondaryCta: { label: 'Adicionar vaga', href: '/dashboard/aplicacoes/nova' },
  }),
}

// Contextos que usam AI para personalizar mensagem
const aiContexts: HeroContext[] = ['proposal_received', 'interview_soon', 'interview_feedback', 'needs_followup', 'active_summary']

async function generateAIMessage(result: ContextDetectionResult): Promise<HeroData | null> {
  const openai = getOpenAIClient()
  
  const prompts: Record<string, string> = {
    proposal_received: `O usuario recebeu uma proposta de emprego da empresa "${result.metadata?.company}" para a vaga de "${result.metadata?.title}". 
Gere uma mensagem curta (maximo 2 frases) e encorajadora, sugerindo que ele avalie a proposta com calma. Seja conciso e direto.`,
    
    interview_soon: `O usuario tem uma entrevista agendada na empresa "${result.metadata?.company}" para a vaga de "${result.metadata?.title}". 
Gere uma mensagem curta (maximo 2 frases) motivacional, sugerindo que ele pratique para a entrevista. Seja conciso e direto.`,
    
    interview_feedback: `O usuario completou uma entrevista simulada (mock interview) para a vaga de "${result.metadata?.cargo}" e tirou ${result.metadata?.score}/100.
${result.metadata?.mainTip ? `Uma dica importante foi: "${result.metadata.mainTip}".` : ''}
Gere uma mensagem curta (maximo 2 frases) comentando o resultado e incentivando-o a explorar o feedback no Copilot para melhorar. Seja encorajador mas direto.`,
    
    needs_followup: `O usuario aplicou para "${result.metadata?.title}" na "${result.metadata?.company}" ha ${result.metadata?.daysSinceUpdate} dias e ainda nao teve retorno.
Gere uma mensagem curta (maximo 2 frases) sugerindo que ele faca um follow-up. Seja conciso e direto.`,
    
    active_summary: `O usuario tem ${result.metadata?.totalApps} aplicacoes, sendo ${result.metadata?.activeApps} ativas.
Gere uma dica do dia curta (maximo 2 frases) para quem esta em busca de emprego. Seja motivacional mas pratico.`,
  }

  const prompt = prompts[result.context]
  if (!prompt) return null

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Voce e um coach de carreira brasileiro amigavel. Responda apenas com a mensagem solicitada, sem introducoes. Use portugues brasileiro informal mas profissional.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const message = response.choices[0]?.message?.content?.trim()
    if (!message) return null

    return buildHeroDataFromAI(result, message)
  } catch (error) {
    console.error('[Hero] AI message generation failed:', error)
    return null
  }
}

function buildHeroDataFromAI(result: ContextDetectionResult, message: string): HeroData {
  const contextConfig: Record<string, { title: string; primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string } }> = {
    proposal_received: {
      title: '🎉 Parabens pela proposta!',
      primaryCta: { label: 'Avaliar proposta', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
      secondaryCta: { label: 'Analisar com Copilot', href: '/dashboard?chat=open' },
    },
    interview_soon: {
      title: '🎤 Entrevista a caminho',
      primaryCta: { label: 'Praticar entrevista', href: '/dashboard/interview-pro' },
      secondaryCta: { label: 'Dicas no Copilot', href: '/dashboard?chat=open' },
    },
    interview_feedback: {
      title: '🎯 Feedback da sua entrevista',
      primaryCta: { label: 'Explorar com Copilot', href: '/dashboard?chat=open&context=interview' },
      secondaryCta: { label: 'Ver resultado', href: `/dashboard/interview-pro/resultado/${result.metadata?.sessionId}` },
    },
    needs_followup: {
      title: '📬 Hora do follow-up',
      primaryCta: { label: 'Criar follow-up', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicacao', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
    },
    active_summary: {
      title: '💡 Dica do Copilot',
      primaryCta: { label: 'Explorar no Copilot', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicacoes', href: '/dashboard/aplicacoes' },
    },
  }

  const config = contextConfig[result.context] || contextConfig.active_summary

  return {
    context: result.context,
    title: config.title,
    message,
    primaryCta: config.primaryCta,
    secondaryCta: config.secondaryCta,
    metadata: result.metadata,
  }
}

// Fallback templates para quando AI falhar
function getFallbackTemplate(result: ContextDetectionResult): HeroData {
  const fallbacks: Record<string, HeroData> = {
    proposal_received: {
      context: 'proposal_received',
      title: '🎉 Parabens pela proposta!',
      message: `Voce recebeu uma proposta da ${result.metadata?.company}! Avalie com calma os beneficios e a cultura da empresa.`,
      primaryCta: { label: 'Avaliar proposta', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
      secondaryCta: { label: 'Analisar com Copilot', href: '/dashboard?chat=open' },
    },
    interview_soon: {
      context: 'interview_soon',
      title: '🎤 Entrevista a caminho',
      message: `Sua entrevista na ${result.metadata?.company} esta chegando! Pratique suas respostas e pesquise sobre a empresa.`,
      primaryCta: { label: 'Praticar entrevista', href: '/dashboard/interview-pro' },
      secondaryCta: { label: 'Dicas no Copilot', href: '/dashboard?chat=open' },
    },
    interview_feedback: {
      context: 'interview_feedback',
      title: '🎯 Feedback da sua entrevista',
      message: `Voce completou uma entrevista para ${result.metadata?.cargo} e tirou ${result.metadata?.score}/100. Explore o feedback com o Copilot para melhorar suas respostas!`,
      primaryCta: { label: 'Explorar com Copilot', href: '/dashboard?chat=open&context=interview' },
      secondaryCta: { label: 'Ver resultado', href: `/dashboard/interview-pro/resultado/${result.metadata?.sessionId}` },
    },
    needs_followup: {
      context: 'needs_followup',
      title: '📬 Hora do follow-up',
      message: `Sua aplicacao para ${result.metadata?.title} na ${result.metadata?.company} esta ha ${result.metadata?.daysSinceUpdate} dias sem retorno. Um follow-up educado pode fazer a diferenca!`,
      primaryCta: { label: 'Criar follow-up', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicacao', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
    },
    active_summary: {
      context: 'active_summary',
      title: '💡 Dica do Copilot',
      message: getRotatingTip(),
      primaryCta: { label: 'Explorar no Copilot', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicacoes', href: '/dashboard/aplicacoes' },
    },
  }

  return fallbacks[result.context] || fallbacks.active_summary
}

export async function buildMessage(result: ContextDetectionResult): Promise<HeroData> {
  // Usa template estatico para contextos simples
  const templateFn = templates[result.context]
  if (templateFn) {
    return templateFn(result.metadata)
  }

  // Para active_summary, usa dica do dia (evita chamadas AI desnecessarias)
  if (result.context === 'active_summary') {
    return getFallbackTemplate(result)
  }

  // Usa AI para contextos que precisam personalizacao (com cache de 24h)
  if (aiContexts.includes(result.context)) {
    const cacheKey = getCacheKey(result.context, result.metadata)
    
    // Verifica cache primeiro
    const cached = getCachedMessage(cacheKey)
    if (cached) {
      return cached
    }

    // Gera mensagem com AI
    const aiMessage = await generateAIMessage(result)
    if (aiMessage) {
      // Salva no cache
      setCachedMessage(cacheKey, aiMessage)
      return aiMessage
    }
    
    // Fallback se AI falhar
    return getFallbackTemplate(result)
  }

  // Default fallback
  return getFallbackTemplate(result)
}
