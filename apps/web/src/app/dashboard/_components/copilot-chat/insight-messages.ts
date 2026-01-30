export const insightInitialMessages: Record<string, string> = {
  avaliando_proposta: 'Vi que voce esta avaliando uma proposta. Me conta mais sobre ela - salario, beneficios, cultura da empresa - que te ajudo a decidir.',
  buscando_emprego: 'Voce esta em busca de novas oportunidades. Vamos conversar sobre o que voce procura e como posso ajudar.',
  negociando_salario: 'Negociar salario pode ser desafiador. Me conta sua situacao atual que te ajudo a montar uma estrategia.',
  transicao_carreira: 'Mudanca de carreira e uma decisao importante. Vamos explorar suas opcoes juntos.',
  crescimento: 'Crescer na carreira exige planejamento. Vamos conversar sobre seus objetivos e proximos passos.',
  estabilidade: 'Manter estabilidade enquanto evolui e um equilibrio delicado. Como posso ajudar?',
  default: 'Vamos conversar sobre seu insight. Como posso ajudar?'
}

// Mensagens iniciais para contextos do Hero Card
export const heroInitialMessages: Record<string, string | ((company?: string, title?: string) => string)> = {
  pending_insight: 'Voce tem um insight pendente! Quer que eu te ajude a entender melhor as recomendacoes?',
  proposal_received: (company) => `Parabens pela proposta${company ? ` da ${company}` : ''}! Vamos analisar juntos? Me conta os detalhes - salario, beneficios, cultura - que te ajudo a avaliar.`,
  interview_soon: (company, title) => `Vi que voce tem uma entrevista${company ? ` na ${company}` : ''}${title ? ` para ${title}` : ''}. Quer praticar? Posso simular perguntas comuns e te dar feedback.`,
  needs_followup: (company, title) => `Sua aplicacao${company ? ` na ${company}` : ''}${title ? ` para ${title}` : ''} esta sem retorno ha alguns dias. Quer que eu te ajude a escrever um follow-up profissional?`,
  stale_apps: 'Notei que algumas aplicacoes estao paradas. Quer revisar juntos o status de cada uma e decidir os proximos passos?',
  low_activity: 'Percebi que faz um tempo desde sua ultima aplicacao. Como esta sua busca? Posso ajudar a encontrar novas oportunidades.',
  new_user: 'Ola! Sou seu Copilot de carreira. Posso te ajudar com candidaturas, preparacao para entrevistas, negociacao salarial e muito mais. Como posso ajudar?',
  active_summary: 'Vi a dica do dia! Quer conversar mais sobre como aplicar isso na sua busca? Estou aqui para ajudar.',
}

export const heroSuggestedQuestions: Record<string, string[]> = {
  pending_insight: [
    'O que significa essa recomendacao?',
    'Quais os proximos passos?',
    'Como posso melhorar meu perfil?',
  ],
  proposal_received: [
    'O salario esta bom?',
    'Devo negociar?',
    'Como avaliar a cultura da empresa?',
    'Quais perguntas fazer antes de aceitar?',
  ],
  interview_soon: [
    'Quais perguntas devo esperar?',
    'Como me preparar em pouco tempo?',
    'O que pesquisar sobre a empresa?',
    'Como responder sobre pretensao salarial?',
  ],
  needs_followup: [
    'Escreve um follow-up pra mim',
    'Quanto tempo esperar antes de desistir?',
    'Devo ligar ou mandar email?',
  ],
  stale_apps: [
    'Como saber se devo desistir de uma vaga?',
    'Vale fazer follow-up?',
    'Como organizar melhor minhas aplicacoes?',
  ],
  low_activity: [
    'Me ajuda a encontrar vagas',
    'Como melhorar meu curriculo?',
    'Quais empresas estao contratando?',
  ],
  new_user: [
    'Como funciona o Copilot?',
    'Como adicionar uma aplicacao?',
    'Como me preparar para entrevistas?',
  ],
  active_summary: [
    'Me conta mais sobre isso',
    'Como aplicar essa dica?',
    'Quais outras dicas voce tem?',
  ],
}

export const insightSuggestedQuestions: Record<string, string[]> = {
  avaliando_proposta: [
    'Qual o salario oferecido?',
    'Quais os beneficios?',
    'Como e a cultura da empresa?',
    'E uma empresa estavel?',
    'Qual o potencial de crescimento?'
  ],
  buscando_emprego: [
    'Que tipo de vaga voce quer?',
    'Qual sua pretensao salarial?',
    'Voce considera remoto?',
    'Quais empresas te interessam?'
  ],
  negociando_salario: [
    'Qual seu salario atual?',
    'Quanto voce quer pedir?',
    'Voce tem outras propostas?',
    'Quando e a conversa?'
  ],
  transicao_carreira: [
    'Para qual area quer ir?',
    'O que te motiva a mudar?',
    'Quais skills voce ja tem?',
    'Voce consideraria ganhar menos inicialmente?'
  ],
  crescimento: [
    'Qual cargo voce almeja?',
    'Quais habilidades precisa desenvolver?',
    'Sua empresa atual oferece oportunidades?',
    'Ja conversou com seu gestor sobre isso?'
  ],
  estabilidade: [
    'O que significa estabilidade para voce?',
    'Como esta sua empresa atual?',
    'Quais sao seus riscos hoje?',
    'Voce tem reserva de emergencia?'
  ],
  default: [
    'O que voce achou do insight?',
    'Tem alguma duvida sobre os proximos passos?',
    'Quer explorar algum ponto especifico?'
  ]
}

// Maps objetivo from EntryFlowData to tipo for insight context
export function mapObjetivoToTipo(objetivo: string): string {
  const mapping: Record<string, string> = {
    'nova_oportunidade': 'buscando_emprego',
    'promocao': 'crescimento',
    'transicao': 'transicao_carreira',
    'aumento': 'negociando_salario',
    'estabilidade': 'estabilidade',
    'outro': 'default'
  }
  return mapping[objetivo] || 'default'
}

// Mensagens iniciais para contexto de entrevista simulada
export function getInterviewInitialMessage(cargo: string, score: number): string {
  if (score >= 80) {
    return `Parabens pela entrevista para ${cargo}! Voce tirou ${score}/100, um otimo resultado. Quer conversar sobre como manter esse nivel ou melhorar ainda mais?`
  } else if (score >= 60) {
    return `Vi sua entrevista para ${cargo} - voce tirou ${score}/100. Bom desempenho! Vamos explorar juntos como melhorar nos pontos que foram sinalizados?`
  } else {
    return `Entendi que a entrevista para ${cargo} foi desafiadora - voce tirou ${score}/100. Nao desanime! Vamos trabalhar juntos nos pontos de melhoria. O que voce achou mais dificil?`
  }
}

export const interviewSuggestedQuestions: string[] = [
  'Como estruturar melhor minhas respostas?',
  'Me de exemplos de respostas usando o metodo STAR',
  'Quais perguntas comportamentais devo praticar?',
  'Como demonstrar lideranca nas respostas?',
  'O que posso fazer para melhorar minha comunicacao?',
  'Quais erros comuns devo evitar em entrevistas?',
  'Como lidar com perguntas dificeis?',
  'Como falar sobre pontos fracos de forma positiva?',
]
