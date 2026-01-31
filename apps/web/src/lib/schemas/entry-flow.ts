import { z } from 'zod'

// Step 1: Contexto Profissional
export const step1Schema = z.object({
  cargo: z.string().min(2, 'Informe seu cargo atual ou último'),
  senioridade: z.enum(['junior', 'pleno', 'senior', 'lead', 'exec'], {
    required_error: 'Selecione sua senioridade',
  }),
  area: z.enum(['tech', 'produto', 'design', 'negocios', 'outro'], {
    required_error: 'Selecione sua área de atuação',
  }),
})

// Step 2: Situacao Atual
export const step2Schema = z.object({
  status: z.enum(['empregado', 'desempregado', 'transicao'], {
    required_error: 'Selecione seu status atual',
  }),
  tempoSituacao: z.enum(['menos_3_meses', '3_6_meses', '6_12_meses', 'mais_1_ano'], {
    required_error: 'Informe há quanto tempo está nessa situação',
  }),
  urgencia: z.number().min(1).max(5),
})

// Step 3: Objetivo
export const step3Schema = z.object({
  objetivo: z.enum(['avaliar_proposta', 'mais_entrevistas', 'mudar_area', 'negociar_salario', 'entender_mercado', 'outro'], {
    required_error: 'Selecione seu objetivo principal',
  }),
  objetivoOutro: z.string().optional(),
})

// Combined schema for full form data
export const entryFlowSchema = step1Schema.merge(step2Schema).merge(step3Schema)

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type EntryFlowData = z.infer<typeof entryFlowSchema>

// Options for select/radio fields
export const senioridadeOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Tech Lead' },
  { value: 'exec', label: 'Executivo / Diretor' },
]

export const areaOptions = [
  { value: 'tech', label: 'Tecnologia / Engenharia' },
  { value: 'produto', label: 'Produto' },
  { value: 'design', label: 'Design / UX' },
  { value: 'negocios', label: 'Negócios / Vendas' },
  { value: 'outro', label: 'Outro' },
]

export const statusOptions = [
  { value: 'empregado', label: 'Empregado', description: 'Trabalhando atualmente' },
  { value: 'desempregado', label: 'Desempregado', description: 'Buscando oportunidades' },
  { value: 'transicao', label: 'Em transição', description: 'Saindo ou com proposta em mão' },
]

export const tempoSituacaoOptions = [
  { value: 'menos_3_meses', label: 'Menos de 3 meses' },
  { value: '3_6_meses', label: '3 a 6 meses' },
  { value: '6_12_meses', label: '6 a 12 meses' },
  { value: 'mais_1_ano', label: 'Mais de 1 ano' },
]

export const objetivoOptions = [
  { value: 'avaliar_proposta', label: 'Avaliar uma proposta', description: 'Tenho uma oferta e preciso decidir' },
  { value: 'mais_entrevistas', label: 'Conseguir mais entrevistas', description: 'Quero aumentar minhas chances' },
  { value: 'mudar_area', label: 'Mudar de área', description: 'Quero transição de carreira' },
  { value: 'negociar_salario', label: 'Negociar salário atual', description: 'Quero ganhar mais onde estou' },
  { value: 'outro', label: 'Outro', description: 'Tenho uma questão diferente' },
]
