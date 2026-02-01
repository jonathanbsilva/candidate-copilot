import type { EntryFlowData } from './schemas/entry-flow'

// 5 Diagnostic Insight Types
export type InsightType =
  | 'movimento_vs_progresso'    // Doing a lot but not advancing
  | 'gargalo_errado'            // Focusing on wrong bottleneck
  | 'desalinhamento_nivel'      // Aiming at wrong seniority level
  | 'estagnacao_invisivel'      // Stagnation they don't see
  | 'esforco_mal_alocado'       // Effort in wrong areas

export interface DiagnosticInsight {
  type: InsightType
  typeLabel: string              // Human-readable type name
  diagnosis: string              // Current situation (diagnosis)
  pattern: string                // Observed pattern
  risk: string                   // Open risk (uncomfortable truth)
  nextStep: string               // One clear action
  inputHash: string              // Hash of inputs for change detection
  confidence: 'high' | 'medium' | 'low'
}

// Labels for insight types
export const insightTypeLabels: Record<InsightType, string> = {
  movimento_vs_progresso: 'Movimento vs Progresso',
  gargalo_errado: 'Gargalo Errado',
  desalinhamento_nivel: 'Desalinhamento de Nível',
  estagnacao_invisivel: 'Estagnação Invisível',
  esforco_mal_alocado: 'Esforço Mal Alocado',
}

// Labels for tempo situacao
const tempoLabels: Record<string, string> = {
  menos_3_meses: 'menos de 3 meses',
  '3_6_meses': '3 a 6 meses',
  '6_12_meses': '6 a 12 meses',
  mais_1_ano: 'mais de 1 ano',
}

// Labels for objetivo
export const objetivoLabels: Record<string, string> = {
  avaliar_proposta: 'avaliar uma proposta',
  mais_entrevistas: 'conseguir mais entrevistas',
  avancar_processos: 'avançar em processos seletivos',
  negociar_salario: 'negociar salário',
  mudar_area: 'mudar de área',
  outro: 'outro objetivo',
}

// Simple hash function for input tracking
function hashInputs(data: EntryFlowData): string {
  const str = JSON.stringify({
    cargo: data.cargo,
    senioridade: data.senioridade,
    area: data.area,
    status: data.status,
    tempoSituacao: data.tempoSituacao,
    urgencia: data.urgencia,
    objetivo: data.objetivo,
    bloqueioDecisao: data.bloqueioDecisao,
    gargaloEntrevistas: data.gargaloEntrevistas,
    faseMaxima: data.faseMaxima,
    sinaisAlavanca: data.sinaisAlavanca,
    tipoPivot: data.tipoPivot,
  })
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// Selection rules for insight type
export function selectInsightType(data: EntryFlowData): { type: InsightType; confidence: 'high' | 'medium' | 'low' } {
  const {
    objetivo,
    status,
    tempoSituacao,
    urgencia,
    senioridade,
    gargaloEntrevistas,
    faseMaxima,
    sinaisAlavanca,
    tipoPivot,
  } = data

  // Rule 1: MOVIMENTO VS PROGRESSO
  // Conditions: High urgency + long time in same situation + employed
  if (
    urgencia >= 4 &&
    tempoSituacao === 'mais_1_ano' &&
    status === 'empregado'
  ) {
    return { type: 'movimento_vs_progresso', confidence: 'high' }
  }

  // Rule 2: GARGALO ERRADO
  // Conditions: mais_entrevistas + nao_sei OR avancar_processos + triagem
  if (
    (objetivo === 'mais_entrevistas' && gargaloEntrevistas === 'nao_sei') ||
    (objetivo === 'avancar_processos' && faseMaxima === 'triagem')
  ) {
    return { type: 'gargalo_errado', confidence: 'high' }
  }

  // Rule 3: DESALINHAMENTO DE NIVEL
  // Conditions: Junior/Pleno applying to senior roles OR Senior being rejected early
  if (
    (senioridade === 'junior' || senioridade === 'pleno') &&
    objetivo === 'avancar_processos' &&
    faseMaxima === 'tecnica'
  ) {
    return { type: 'desalinhamento_nivel', confidence: 'medium' }
  }

  // Rule 4: ESTAGNACAO INVISIVEL
  // Conditions: empregado + mais_1_ano + baixa urgencia + negociar_salario sem alavanca
  if (
    status === 'empregado' &&
    tempoSituacao === 'mais_1_ano' &&
    urgencia <= 2 &&
    objetivo === 'negociar_salario' &&
    sinaisAlavanca === 'nenhum'
  ) {
    return { type: 'estagnacao_invisivel', confidence: 'high' }
  }

  // Rule 5: ESFORCO MAL ALOCADO
  // Conditions: mudar_area + mudanca_total + high urgency
  if (
    objetivo === 'mudar_area' &&
    tipoPivot === 'mudanca_total' &&
    urgencia >= 4
  ) {
    return { type: 'esforco_mal_alocado', confidence: 'high' }
  }

  // Additional context-based rules

  // High urgency + unemployed + looking for more interviews
  if (
    urgencia >= 4 &&
    status === 'desempregado' &&
    objetivo === 'mais_entrevistas'
  ) {
    return { type: 'gargalo_errado', confidence: 'medium' }
  }

  // Employed for long time + any objective
  if (
    status === 'empregado' &&
    tempoSituacao === 'mais_1_ano' &&
    urgencia >= 3
  ) {
    return { type: 'movimento_vs_progresso', confidence: 'medium' }
  }

  // FALLBACK: movimento_vs_progresso (safest default)
  return { type: 'movimento_vs_progresso', confidence: 'low' }
}

// Diagnostic templates per type
type TemplateGenerator = (data: EntryFlowData) => Omit<DiagnosticInsight, 'inputHash' | 'confidence'>

const diagnosticTemplates: Record<InsightType, TemplateGenerator> = {
  movimento_vs_progresso: (data) => ({
    type: 'movimento_vs_progresso',
    typeLabel: insightTypeLabels.movimento_vs_progresso,
    diagnosis: `Você está ativo no mercado há ${tempoLabels[data.tempoSituacao]}, mas a urgência alta (${data.urgencia}/5) sugere que o progresso não está aparecendo como esperado.`,
    pattern: `Profissionais nessa situação costumam confundir volume de ações (aplicar mais, fazer mais cursos) com avanço real. O resultado é exaustão sem mudança de patamar.`,
    risk: `Se você continuar no mesmo ritmo sem diagnosticar onde trava, corre o risco de queimar energia e oportunidades sem sair do lugar.`,
    nextStep: `Pare de aplicar por 1 semana. Liste as últimas 10 ações que você tomou e marque quais geraram RESPOSTA (não likes, não views — resposta real).`,
  }),

  gargalo_errado: (data) => ({
    type: 'gargalo_errado',
    typeLabel: insightTypeLabels.gargalo_errado,
    diagnosis: `Você quer ${objetivoLabels[data.objetivo]}, mas indicou que ${data.gargaloEntrevistas === 'nao_sei' ? 'não sabe onde trava' : 'trava na triagem inicial'}. Isso é comum e importante de identificar.`,
    pattern: `Quando não sabemos o gargalo, tendemos a otimizar o que é visível (currículo, LinkedIn) em vez do que é crítico (posicionamento, timing, fit).`,
    risk: `Investir energia no lugar errado cria a ilusão de progresso. O currículo perfeito não salva um posicionamento confuso.`,
    nextStep: `Revise suas últimas 5 candidaturas: quantas tiveram resposta? Se menos de 20%, o problema é posicionamento, não currículo.`,
  }),

  desalinhamento_nivel: (data) => ({
    type: 'desalinhamento_nivel',
    typeLabel: insightTypeLabels.desalinhamento_nivel,
    diagnosis: `Você está em nível ${data.senioridade} e trava na fase técnica dos processos. Isso pode indicar um desalinhamento entre o nível das vagas que aplica e sua experiência atual.`,
    pattern: `É comum profissionais aplicarem para vagas um nível acima por ambição ou por má calibração do mercado. O resultado são rejeições que parecem injustas.`,
    risk: `Continuar aplicando para vagas desalinhadas pode gerar frustração e corroer sua confiança técnica — mesmo que você seja competente no seu nível.`,
    nextStep: `Analise as 3 últimas rejeições técnicas: o feedback menciona gaps específicos? Se sim, foque neles. Se não, reveja se o nível da vaga era realista.`,
  }),

  estagnacao_invisivel: (data) => ({
    type: 'estagnacao_invisivel',
    typeLabel: insightTypeLabels.estagnacao_invisivel,
    diagnosis: `Você está empregado há ${tempoLabels[data.tempoSituacao]}, quer negociar salário mas não tem alavanca clara. Sua urgência baixa (${data.urgencia}/5) pode estar mascarando uma estagnação.`,
    pattern: `Profissionais nessa situação costumam adiar a conversa de salário esperando o "momento certo" que nunca chega. Enquanto isso, o mercado segue precificando outros.`,
    risk: `Cada mês sem ajuste é dinheiro deixado na mesa. A zona de conforto atual pode estar custando caro no longo prazo.`,
    nextStep: `Calcule quanto você perdeu nos últimos 12 meses se estiver 15% abaixo do mercado. Use esse número como motivador para criar alavanca.`,
  }),

  esforco_mal_alocado: (data) => ({
    type: 'esforco_mal_alocado',
    typeLabel: insightTypeLabels.esforco_mal_alocado,
    diagnosis: `Você quer fazer uma mudança total de área com urgência alta (${data.urgencia}/5). Essa combinação exige cuidado: mudanças radicais sob pressão costumam gerar arrependimento.`,
    pattern: `Profissionais ansiosos por mudança tendem a romantizar a nova área e subestimar a curva de aprendizado. A grama parece mais verde, mas o esforço é real.`,
    risk: `Uma transição mal planejada pode significar recomeçar do zero: salário, senioridade e rede de contatos. A pressa pode custar anos de progresso.`,
    nextStep: `Converse com 3 pessoas que fizeram a transição que você quer. Pergunte: "O que você gostaria de saber antes de mudar?" e "Quanto tempo levou para recuperar seu patamar?"`,
  }),
}

// Main function to generate diagnostic insight
export function generateDiagnosticInsight(data: EntryFlowData): DiagnosticInsight {
  const { type, confidence } = selectInsightType(data)
  const template = diagnosticTemplates[type]
  const baseInsight = template(data)

  return {
    ...baseInsight,
    inputHash: hashInputs(data),
    confidence,
  }
}

// Re-export labels from original engine for backward compatibility
export { senioridadeLabels, areaLabels, statusLabels } from './insight-engine'

// Export legacy generateInsight for backward compatibility
export { generateInsight, type Insight } from './insight-engine'
