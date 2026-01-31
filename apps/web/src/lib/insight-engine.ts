import type { EntryFlowData } from './schemas/entry-flow'

export interface Insight {
  recommendation: string
  why: string[]
  risks: string[]
  nextSteps: string[]
}

// Rule-based insight generation engine
export function generateInsight(data: EntryFlowData): Insight {
  const { cargo, senioridade, area, status, tempoSituacao, urgencia, objetivo } = data

  // Base insights by objective
  const objectiveInsights: Record<string, Insight> = {
    avaliar_proposta: {
      recommendation: 'Avalie a proposta com calma antes de decidir',
      why: [
        'Decisões apressadas em transição de carreira costumam gerar arrependimento',
        'O mercado atual exige análise cuidadosa de benefícios além do salário',
        'Sua senioridade permite negociar melhores condições',
      ],
      risks: [
        'Aceitar sem negociar pode deixar dinheiro na mesa',
        'Focar só no salário pode esconder problemas de cultura',
      ],
      nextSteps: [
        'Liste seus 3 critérios mais importantes (além de salário)',
        'Pesquise o Glassdoor e LinkedIn da empresa',
        'Prepare 3 perguntas sobre cultura e expectativas',
      ],
    },
    mais_entrevistas: {
      recommendation: 'Ajuste sua estratégia de posicionamento',
      why: [
        'Candidatos que se posicionam claramente têm 3x mais retorno',
        'Seu perfil tem potencial mas precisa de diferenciação',
        'O mercado valoriza especialistas com clareza de proposta',
      ],
      risks: [
        'Aplicar para tudo dilui sua marca pessoal',
        'Currículo genérico compete com milhares de outros',
      ],
      nextSteps: [
        'Defina 3 empresas-alvo e personalize abordagem',
        'Atualize seu LinkedIn com palavras-chave da área',
        'Pratique seu pitch de 30 segundos',
      ],
    },
    mudar_area: {
      recommendation: 'Planeje sua transição em fases',
      why: [
        'Transições bem-sucedidas são graduais, não radicais',
        'Suas habilidades atuais são transferíveis com o posicionamento certo',
        'O mercado aceita transições quando bem justificadas',
      ],
      risks: [
        'Mudar sem preparação pode significar recomeçar do zero',
        'Ansiedade pode levar a decisões precipitadas',
      ],
      nextSteps: [
        'Mapeie 5 habilidades que se transferem para a nova área',
        'Conecte com 3 pessoas que fizeram transição similar',
        'Comece um projeto paralelo na nova área',
      ],
    },
    negociar_salario: {
      recommendation: 'Prepare sua negociação com dados',
      why: [
        'Negociações baseadas em dados têm 40% mais sucesso',
        'Sua experiência justifica uma revisão salarial',
        'Momento de mercado favorece profissionais posicionados',
      ],
      risks: [
        'Negociar sem preparação pode enfraquecer sua posição',
        'Focar só em salário ignora outros benefícios valiosos',
      ],
      nextSteps: [
        'Pesquise faixas salariais no Glassdoor e Levels.fyi',
        'Liste suas entregas dos últimos 6 meses',
        'Agende conversa com seu gestor com antecedência',
      ],
    },
    outro: {
      recommendation: 'Defina seu proximo passo com clareza',
      why: [
        'Clareza de objetivo acelera qualquer processo de carreira',
        'Seu contexto atual permite explorar opções',
        'Decisões conscientes geram melhores resultados',
      ],
      risks: [
        'Paralisia por análise pode atrasar seu progresso',
        'Falta de foco dispersa energia e oportunidades',
      ],
      nextSteps: [
        'Escreva em uma frase o que você quer em 6 meses',
        'Identifique 1 ação que você pode fazer essa semana',
        'Converse com alguém que já chegou onde você quer',
      ],
    },
  }

  // Get base insight
  const baseInsight = objectiveInsights[objetivo] || objectiveInsights.outro

  // Customize based on context
  const customizedInsight = { ...baseInsight }

  // Adjust for status
  if (status === 'desempregado') {
    customizedInsight.why = [
      ...customizedInsight.why.slice(0, 2),
      'Em período de transição, foco e estratégia são ainda mais importantes',
    ]
  }

  // Adjust for urgency
  if (urgencia >= 4) {
    customizedInsight.nextSteps = [
      `URGENTE: ${customizedInsight.nextSteps[0]}`,
      ...customizedInsight.nextSteps.slice(1),
    ]
    customizedInsight.risks = [
      'Pressão por urgência pode levar a decisões subótimas',
      ...customizedInsight.risks,
    ]
  }

  // Adjust for seniority
  if (senioridade === 'junior' || senioridade === 'pleno') {
    customizedInsight.nextSteps.push('Busque mentoria de alguém mais sênior na área')
  } else if (senioridade === 'lead' || senioridade === 'exec') {
    customizedInsight.why = [
      'Sua posição de liderança traz oportunidades únicas',
      ...customizedInsight.why.slice(0, 2),
    ]
  }

  // Adjust for time in situation
  if (tempoSituacao === 'mais_1_ano' && status === 'empregado') {
    customizedInsight.why.push('Mais de 1 ano na mesma situação indica momento de reflexão')
  }

  return customizedInsight
}

// Helper to get display labels
export const senioridadeLabels: Record<string, string> = {
  junior: 'Junior',
  pleno: 'Pleno',
  senior: 'Senior',
  lead: 'Lead',
  exec: 'Executivo',
}

export const areaLabels: Record<string, string> = {
  tech: 'Tecnologia',
  produto: 'Produto',
  design: 'Design',
  negocios: 'Negocios',
  outro: 'Outro',
}

export const statusLabels: Record<string, string> = {
  empregado: 'Empregado',
  desempregado: 'Desempregado',
  transicao: 'Em transicao',
}

export const objetivoLabels: Record<string, string> = {
  avaliar_proposta: 'Avaliar proposta',
  mais_entrevistas: 'Conseguir mais entrevistas',
  mudar_area: 'Mudar de area',
  negociar_salario: 'Negociar salario',
  outro: 'Outro objetivo',
}
