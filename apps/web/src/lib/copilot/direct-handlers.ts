import type { UserContext } from './types'

type DirectHandler = (ctx: UserContext) => string

export const directHandlers: Record<string, DirectHandler> = {
  'taxa de conversao': (ctx) => {
    const taxa = ctx.metrics.taxaConversao
    const total = ctx.profile.totalApplications
    const entrevistas = ctx.metrics.processosAtivos
    
    if (total === 0) {
      return `Você ainda não tem candidaturas registradas. Adicione suas primeiras candidaturas para começar a acompanhar sua taxa de conversão!`
    }
    
    let analise = ''
    if (taxa >= 30) {
      analise = '\n\nIsso está **acima da média** do mercado (25-30%). Excelente trabalho!'
    } else if (taxa >= 20) {
      analise = '\n\nIsso está **dentro da média** do mercado (25-30%). Continue aplicando!'
    } else if (taxa > 0) {
      analise = '\n\nIsso está **abaixo da média** do mercado (25-30%). Considere revisar seu currículo ou focar em vagas mais alinhadas ao seu perfil.'
    }
    
    return `Sua taxa de conversão atual é de **${taxa}%**.

Isso significa que de **${total} candidaturas**, você conseguiu **${entrevistas} entrevistas**.${analise}`
  },

  'quantas candidaturas': (ctx) => {
    const aguardando = ctx.metrics.aguardandoResposta
    const pending = ctx.pendingApplications
    
    if (aguardando === 0) {
      return `Você não tem candidaturas aguardando resposta no momento.

${ctx.metrics.processosAtivos > 0 
  ? `Você tem **${ctx.metrics.processosAtivos} processos ativos** (entrevistas ou propostas).`
  : 'Que tal aplicar para novas vagas?'}`
    }
    
    let response = `Você tem **${aguardando} candidaturas** aguardando resposta.`
    
    if (pending.length > 0) {
      const oldest = pending[0]
      response += `\n\nA mais antiga é **${oldest.company}** (${oldest.daysSinceApplied} dias).`
      
      if (oldest.daysSinceApplied > 10) {
        response += `\n\n**Dica:** Considere fazer um follow-up educado, pois já passou mais de 10 dias.`
      }
    }
    
    return response
  },

  'quantas entrevistas': (ctx) => {
    const entrevistas = ctx.recentApplications.filter(a => a.status === 'entrevista').length
    const propostas = ctx.metrics.ofertas
    
    if (entrevistas === 0 && propostas === 0) {
      return `Você não tem entrevistas ou propostas ativas no momento.

Continue aplicando! Com ${ctx.profile.totalApplications} candidaturas e taxa de ${ctx.metrics.taxaConversao}%, você está no caminho.`
    }
    
    return `Você tem **${entrevistas} entrevistas** agendadas e **${propostas} propostas** em aberto.

${propostas > 0 ? '**Boa notícia!** Você está próximo de uma oferta.' : 'Continue se preparando bem para as entrevistas!'}`
  },

  'ultimo insight': (ctx) => {
    if (ctx.insights.length === 0) {
      return `Você ainda não gerou nenhuma análise. 

Acesse a página de **Análises** para fazer uma análise personalizada da sua busca de emprego!`
    }
    
    const insight = ctx.insights[0]
    
    return `**Sua última análise** (${insight.createdAt}):

**Recomendação:** ${insight.recommendation}

**Por quê:**
${insight.why.map(w => `- ${w}`).join('\n')}

**Riscos a considerar:**
${insight.risks.map(r => `- ${r}`).join('\n')}

**Próximos passos:**
${insight.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
  },

  'suas recomendacoes': (ctx) => {
    if (ctx.insights.length === 0) {
      return `Ainda não tenho recomendações para você. 

Faça uma análise na página de **Análises** para receber recomendações personalizadas!`
    }
    
    return `**Minhas recomendações para você:**

${ctx.insights.slice(0, 3).map((insight, i) => 
  `${i + 1}. **${insight.recommendation}** (${insight.createdAt})`
).join('\n')}

${ctx.insights.length > 3 ? `\n_E mais ${ctx.insights.length - 3} análises anteriores..._` : ''}`
  },

  'riscos identificou': (ctx) => {
    if (ctx.insights.length === 0) {
      return `Ainda não identifiquei riscos porque você não gerou nenhuma análise.

Faça uma análise na página de **Análises** para que eu possa avaliar sua situação!`
    }
    
    const lastInsight = ctx.insights[0]
    
    return `**Riscos que identifiquei na sua busca** (${lastInsight.createdAt}):

${lastInsight.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Dica:** Leve esses pontos em consideração ao planejar seus próximos passos.`
  },

  'proximos passos sugeriu': (ctx) => {
    if (ctx.insights.length === 0) {
      return `Ainda não sugeri próximos passos porque você não gerou nenhuma análise.

Faça uma análise na página de **Análises** para receber sugestões personalizadas!`
    }
    
    const lastInsight = ctx.insights[0]
    
    return `**Próximos passos que sugeri** (${lastInsight.createdAt}):

${lastInsight.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Quantos desses você já completou?`
  },

  'aguardando resposta': (ctx) => {
    const pending = ctx.pendingApplications
    
    if (pending.length === 0) {
      return `Você não tem candidaturas aguardando resposta no momento.`
    }
    
    let response = `**${pending.length} candidaturas aguardando resposta:**\n`
    
    pending.slice(0, 5).forEach((app, i) => {
      const urgency = app.daysSinceApplied > 10 ? ' ⚠️' : ''
      response += `\n${i + 1}. **${app.company}** - ${app.title} (${app.daysSinceApplied} dias)${urgency}`
    })
    
    if (pending.length > 5) {
      response += `\n\n_E mais ${pending.length - 5} outras..._`
    }
    
    const needsFollowUp = pending.filter(p => p.daysSinceApplied > 10)
    if (needsFollowUp.length > 0) {
      response += `\n\n**Sugestão:** ${needsFollowUp.length} empresa(s) precisam de follow-up (mais de 10 dias).`
    }
    
    return response
  },

  'empresa mais antiga': (ctx) => {
    const pending = ctx.pendingApplications
    
    if (pending.length === 0) {
      return `Você não tem candidaturas aguardando resposta no momento.`
    }
    
    const oldest = pending[0]
    
    return `A empresa mais antiga sem resposta é **${oldest.company}** (${oldest.title}).

Você aplicou há **${oldest.daysSinceApplied} dias**.

${oldest.daysSinceApplied > 14 
  ? '**Recomendação:** Já passou de 2 semanas. Considere fazer um follow-up ou seguir em frente.'
  : oldest.daysSinceApplied > 7
    ? '**Dica:** Passou de 1 semana. Um follow-up educado pode ser uma boa ideia.'
    : 'Ainda está dentro do prazo normal de resposta (7-14 dias).'}`
  }
}

export function findMatchingHandler(question: string): DirectHandler | null {
  const normalized = question.toLowerCase()
  
  for (const [keyword, handler] of Object.entries(directHandlers)) {
    if (normalized.includes(keyword)) {
      return handler
    }
  }
  
  return null
}
