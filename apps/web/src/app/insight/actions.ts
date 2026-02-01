'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { canGenerateInsight } from '@/lib/subscription/check-access'
import { incrementInsightUsage } from '@/lib/subscription/actions'
import {
  generateDiagnosticInsight as generateTemplateInsight,
  selectInsightType,
  type DiagnosticInsight,
} from '@/lib/insight-engine-v2'
import { generateLLMInsight } from '@/lib/insight-engine-llm'
import type { EntryFlowData } from '@/lib/schemas/entry-flow'

const insightSchema = z.object({
  // Entry flow data (camelCase from frontend)
  cargo: z.string(),
  senioridade: z.string(),
  area: z.string(),
  status: z.string(),
  tempoSituacao: z.string().optional(),
  urgencia: z.number().optional(),
  objetivo: z.string(),
  // V1.1 contextual follow-up fields
  decisionBlocker: z.string().optional(),
  interviewBottleneck: z.string().optional(),
  maxStage: z.string().optional(),
  leverageSignals: z.string().optional(),
  pivotType: z.string().optional(),
  transferableStrengths: z.string().optional(),
  avoidedDecision: z.string().optional(),
  // V1.1 diagnostic insight fields
  type: z.string().optional(),
  typeLabel: z.string().optional(),
  diagnosis: z.string().optional(),
  pattern: z.string().optional(),
  risk: z.string().optional(),
  nextStep: z.string().optional(),
  inputHash: z.string().optional(),
  confidence: z.string().optional(),
  // Legacy fields (for backward compatibility)
  recommendation: z.string().optional(),
  why: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
})

export type InsightData = z.infer<typeof insightSchema>

// Check if user can generate insight (for logged in users)
export async function checkInsightAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Not logged in - allow generation but don't track
    return { allowed: true, remaining: null, limit: null, plan: null }
  }
  
  const access = await canGenerateInsight(user.id)
  return access
}

export async function saveInsight(data: InsightData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Check if user has access before saving
  const access = await canGenerateInsight(user.id)
  if (!access.allowed) {
    return { error: 'Limite de análises atingido', limitReached: true }
  }
  
  const validated = insightSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Dados inválidos' }
  }
  
  const { data: insertedInsight, error } = await supabase
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
      // V1.1 contextual follow-up fields
      decision_blocker: validated.data.decisionBlocker,
      interview_bottleneck: validated.data.interviewBottleneck,
      max_stage: validated.data.maxStage,
      leverage_signals: validated.data.leverageSignals,
      pivot_type: validated.data.pivotType,
      transferable_strengths: validated.data.transferableStrengths,
      avoided_decision: validated.data.avoidedDecision,
      // V1.1 diagnostic insight fields
      type: validated.data.type,
      type_label: validated.data.typeLabel,
      diagnosis: validated.data.diagnosis,
      pattern: validated.data.pattern,
      risk: validated.data.risk,
      next_step: validated.data.nextStep,
      input_hash: validated.data.inputHash,
      confidence: validated.data.confidence,
      // Backward compatibility: use diagnosis as recommendation for V1.1
      recommendation: validated.data.recommendation || validated.data.diagnosis || 'Análise de carreira',
      // Legacy fields (for backward compatibility) - provide empty arrays as fallback
      why: validated.data.why || [],
      risks: validated.data.risks || (validated.data.risk ? [validated.data.risk] : []),
      next_steps: validated.data.nextSteps || (validated.data.nextStep ? [validated.data.nextStep] : []),
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error saving insight:', error)
    return { error: 'Erro ao salvar insight' }
  }
  
  // Increment usage counter after successful save
  await incrementInsightUsage()
  
  // Revalidate dashboard pages to show new insight
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/insights')
  
  return { success: true, insightId: insertedInsight?.id }
}

/**
 * Generate insight server-side (A/B test via env var)
 * - ENABLE_LLM_INSIGHTS=false (default): uses rule-based templates
 * - ENABLE_LLM_INSIGHTS=true: generates via LLM for personalization
 */
export async function generateInsightAction(data: EntryFlowData): Promise<{
  success: boolean
  insight?: DiagnosticInsight
  source: 'template' | 'llm'
  error?: string
}> {
  const enableLLM = process.env.ENABLE_LLM_INSIGHTS === 'true'
  
  // Always use rule-based selection for insight type (consistent behavior)
  const { type, confidence } = selectInsightType(data)
  
  if (!enableLLM) {
    // A/B: Control group - use templates
    const insight = generateTemplateInsight(data)
    return { success: true, insight, source: 'template' }
  }
  
  try {
    // A/B: Treatment group - use LLM
    const llmInsight = await generateLLMInsight(data, type, confidence)
    return { success: true, insight: llmInsight, source: 'llm' }
  } catch (error) {
    console.error('[generateInsightAction] LLM generation failed, falling back to template:', error)
    // Fallback to template if LLM fails
    const insight = generateTemplateInsight(data)
    return { success: true, insight, source: 'template' }
  }
}
