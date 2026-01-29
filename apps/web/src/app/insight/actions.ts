'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const insightSchema = z.object({
  // Entry flow data (camelCase from frontend)
  cargo: z.string(),
  senioridade: z.string(),
  area: z.string(),
  status: z.string(),
  tempoSituacao: z.string().optional(),
  urgencia: z.number().optional(),
  objetivo: z.string(),
  objetivoOutro: z.string().optional(),
  // Generated insight
  recommendation: z.string(),
  why: z.array(z.string()),
  risks: z.array(z.string()),
  nextSteps: z.array(z.string()),
})

export type InsightData = z.infer<typeof insightSchema>

export async function saveInsight(data: InsightData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Nao autenticado' }
  }
  
  const validated = insightSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Dados invalidos' }
  }
  
  const { error } = await supabase
    .from('insights')
    .insert({
      user_id: user.id,
      cargo: validated.data.cargo,
      senioridade: validated.data.senioridade,
      area: validated.data.area,
      status: validated.data.status,
      tempo_situacao: validated.data.tempoSituacao,
      urgencia: validated.data.urgencia,
      objetivo: validated.data.objetivo,
      objetivo_outro: validated.data.objetivoOutro,
      recommendation: validated.data.recommendation,
      why: validated.data.why,
      risks: validated.data.risks,
      next_steps: validated.data.nextSteps,
    })
  
  if (error) {
    console.error('Error saving insight:', error)
    return { error: 'Erro ao salvar insight' }
  }
  
  return { success: true }
}
