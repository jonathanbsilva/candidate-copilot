export const insightInitialMessages: Record<string, string> = {
  avaliando_proposta: 'Vi que você está avaliando uma proposta. Me conta mais sobre ela - salário, benefícios, cultura da empresa - que te ajudo a decidir.',
  buscando_emprego: 'Você está em busca de novas oportunidades. Vamos conversar sobre o que você procura e como posso ajudar.',
  negociando_salario: 'Negociar salário pode ser desafiador. Me conta sua situação atual que te ajudo a montar uma estratégia.',
  transicao_carreira: 'Mudança de carreira é uma decisão importante. Vamos explorar suas opções juntos.',
  crescimento: 'Crescer na carreira exige planejamento. Vamos conversar sobre seus objetivos e próximos passos.',
  estabilidade: 'Manter estabilidade enquanto evolui é um equilíbrio delicado. Como posso ajudar?',
  default: 'Vamos conversar sobre seu insight. Como posso ajudar?'
}

// Mensagens iniciais para contextos do Hero Card
export const heroInitialMessages: Record<string, string | ((company?: string, title?: string) => string)> = {
  pending_insight: 'Você tem um insight pendente! Quer que eu te ajude a entender melhor as recomendações?',
  proposal_received: (company) => `Parabéns pela proposta${company ? ` da ${company}` : ''}! Vamos analisar juntos? Me conta os detalhes - salário, benefícios, cultura - que te ajudo a avaliar.`,
  interview_soon: (company, title) => `Vi que você tem uma entrevista${company ? ` na ${company}` : ''}${title ? ` para ${title}` : ''}. Quer praticar? Posso simular perguntas comuns e te dar feedback.`,
  needs_followup: (company, title) => `Sua aplicação${company ? ` na ${company}` : ''}${title ? ` para ${title}` : ''} está sem retorno há alguns dias. Quer que eu te ajude a escrever um follow-up profissional?`,
  stale_apps: 'Notei que algumas aplicações estão paradas. Quer revisar juntos o status de cada uma e decidir os próximos passos?',
  low_activity: 'Percebi que faz um tempo desde sua última aplicação. Como está sua busca? Posso ajudar a encontrar novas oportunidades.',
  new_user: 'Olá! Sou seu Copilot de carreira. Posso te ajudar com candidaturas, preparação para entrevistas, negociação salarial e muito mais. Como posso ajudar?',
  active_summary: 'Vi a dica do dia! Quer conversar mais sobre como aplicar isso na sua busca? Estou aqui para ajudar.',
}

export const heroSuggestedQuestions: Record<string, string[]> = {
  pending_insight: [
    'O que significa essa recomendação?',
    'Quais os próximos passos?',
    'Como posso melhorar meu perfil?',
  ],
  proposal_received: [
    'O salário está bom?',
    'Devo negociar?',
    'Como avaliar a cultura da empresa?',
    'Quais perguntas fazer antes de aceitar?',
  ],
  interview_soon: [
    'Quais perguntas devo esperar?',
    'Como me preparar em pouco tempo?',
    'O que pesquisar sobre a empresa?',
    'Como responder sobre pretensão salarial?',
  ],
  needs_followup: [
    'Escreve um follow-up pra mim',
    'Quanto tempo esperar antes de desistir?',
    'Devo ligar ou mandar email?',
  ],
  stale_apps: [
    'Como saber se devo desistir de uma vaga?',
    'Vale fazer follow-up?',
    'Como organizar melhor minhas aplicações?',
  ],
  low_activity: [
    'Me ajuda a encontrar vagas',
    'Como melhorar meu currículo?',
    'Quais empresas estão contratando?',
  ],
  new_user: [
    'Como funciona o Copilot?',
    'Como adicionar uma aplicação?',
    'Como me preparar para entrevistas?',
  ],
  active_summary: [
    'Me conta mais sobre isso',
    'Como aplicar essa dica?',
    'Quais outras dicas você tem?',
  ],
}

export const insightSuggestedQuestions: Record<string, string[]> = {
  avaliando_proposta: [
    'Qual o salário oferecido?',
    'Quais os benefícios?',
    'Como é a cultura da empresa?',
    'É uma empresa estável?',
    'Qual o potencial de crescimento?'
  ],
  buscando_emprego: [
    'Que tipo de vaga você quer?',
    'Qual sua pretensão salarial?',
    'Você considera remoto?',
    'Quais empresas te interessam?'
  ],
  negociando_salario: [
    'Qual seu salário atual?',
    'Quanto você quer pedir?',
    'Você tem outras propostas?',
    'Quando é a conversa?'
  ],
  transicao_carreira: [
    'Para qual área quer ir?',
    'O que te motiva a mudar?',
    'Quais skills você já tem?',
    'Você consideraria ganhar menos inicialmente?'
  ],
  crescimento: [
    'Qual cargo você almeja?',
    'Quais habilidades precisa desenvolver?',
    'Sua empresa atual oferece oportunidades?',
    'Já conversou com seu gestor sobre isso?'
  ],
  estabilidade: [
    'O que significa estabilidade para você?',
    'Como está sua empresa atual?',
    'Quais são seus riscos hoje?',
    'Você tem reserva de emergência?'
  ],
  default: [
    'O que você achou do insight?',
    'Tem alguma dúvida sobre os próximos passos?',
    'Quer explorar algum ponto específico?'
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
    return `Parabéns pela entrevista para ${cargo}! Você tirou ${score}/100, um ótimo resultado. Quer conversar sobre como manter esse nível ou melhorar ainda mais?`
  } else if (score >= 60) {
    return `Vi sua entrevista para ${cargo} - você tirou ${score}/100. Bom desempenho! Vamos explorar juntos como melhorar nos pontos que foram sinalizados?`
  } else {
    return `Entendi que a entrevista para ${cargo} foi desafiadora - você tirou ${score}/100. Não desanime! Vamos trabalhar juntos nos pontos de melhoria. O que você achou mais difícil?`
  }
}

export const interviewSuggestedQuestions: string[] = [
  'Como estruturar melhor minhas respostas?',
  'Me dê exemplos de respostas usando o método STAR',
  'Quais perguntas comportamentais devo praticar?',
'Como demonstrar liderança nas respostas?',
    'O que posso fazer para melhorar minha comunicação?',
  'Quais erros comuns devo evitar em entrevistas?',
  'Como lidar com perguntas difíceis?',
  'Como falar sobre pontos fracos de forma positiva?',
]

// Mensagem inicial para contexto de benchmark
export function getBenchmarkInitialMessage(userTaxa: number, mediaTaxa: number, isAbove: boolean, percentil: number): string {
  if (isAbove) {
    const topPercent = 100 - percentil
    if (topPercent <= 20) {
      return `Parabéns! Sua taxa de conversão de **${userTaxa}%** está no top ${topPercent}% dos usuários da plataforma. Você está indo muito bem! Quer entender o que pode fazer para manter esse ritmo ou melhorar ainda mais?`
    }
    return `Boa notícia! Sua taxa de conversão de **${userTaxa}%** está acima da média de ${mediaTaxa}% dos outros usuários. Quer conversar sobre como você pode manter esse bom desempenho?`
  } else if (userTaxa === mediaTaxa) {
    return `Sua taxa de conversão de **${userTaxa}%** está na média da plataforma. Isso é um bom ponto de partida! Vamos conversar sobre como você pode se destacar e ultrapassar essa marca?`
  } else {
    return `Sua taxa de conversão de **${userTaxa}%** está um pouco abaixo da média de ${mediaTaxa}%. Não se preocupe - isso é muito comum e existem várias formas de melhorar! Vamos conversar sobre estratégias?`
  }
}

export const benchmarkSuggestedQuestions: string[] = [
  'Como posso melhorar minha taxa de conversão?',
  'O que significa essa taxa na prática?',
  'Quais estratégias funcionam para conseguir mais entrevistas?',
  'Como personalizar melhor minhas candidaturas?',
  'Devo aplicar para mais vagas ou focar em qualidade?',
  'Como saber se estou aplicando para as vagas certas?',
  'Qual a importância do currículo na taxa de conversão?',
  'Como otimizar meu perfil LinkedIn?',
]
