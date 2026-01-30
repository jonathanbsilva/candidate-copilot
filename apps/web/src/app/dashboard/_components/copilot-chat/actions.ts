'use server'

import { createClient } from '@/lib/supabase/server'
import { buildUserContext, buildSystemPrompt } from '@/lib/copilot/context-builder'
import { handleQuery } from '@/lib/copilot/query-handler'
import { getAIProvider } from '@/lib/ai'
import { validateInput, checkTopic } from '@/lib/ai/security'
import { canUseCopilot } from '@/lib/subscription/check-access'
import { incrementCopilotUsage } from '@/lib/subscription/actions'
import type { UserContext, ChatMessage, InsightContextData, HeroContextData, InterviewContextData, InterviewHistoryData } from '@/lib/copilot/types'

export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Nao autenticado')
  }
  
  // Buscar aplicacoes
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  // Buscar insights (todos para ter historico)
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  // Buscar historico de entrevistas simuladas (Interview Pro)
  const { data: interviewSessions } = await supabase
    .from('interview_sessions')
    .select('cargo, area, overall_score, feedback, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)
  
  // Processar historico de entrevistas
  let interviewHistory: InterviewHistoryData | null = null
  if (interviewSessions && interviewSessions.length > 0) {
    const scores = interviewSessions
      .map(s => s.overall_score)
      .filter((s): s is number => s !== null)
    
    interviewHistory = {
      totalSessions: interviewSessions.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      lastScore: interviewSessions[0]?.overall_score || null,
      lastSessionDate: interviewSessions[0]?.completed_at || null,
      recentSessions: interviewSessions.slice(0, 3).map(session => {
        const feedback = session.feedback as { per_question?: Array<{ strengths?: string[], improvements?: string[] }> } | null
        const allStrengths: string[] = []
        const allImprovements: string[] = []
        
        feedback?.per_question?.forEach(q => {
          if (q.strengths) allStrengths.push(...q.strengths)
          if (q.improvements) allImprovements.push(...q.improvements)
        })
        
        return {
          cargo: session.cargo,
          score: session.overall_score || 0,
          completedAt: session.completed_at ? new Date(session.completed_at).toLocaleDateString('pt-BR') : '',
          mainStrengths: [...new Set(allStrengths)].slice(0, 2),
          mainImprovements: [...new Set(allImprovements)].slice(0, 2),
        }
      })
    }
  }
  
  const context = buildUserContext(applications, insights)
  context.interviewHistory = interviewHistory
  
  return context
}

export interface ChatResponse {
  message: string
  isDirect: boolean
  limitReached?: boolean
}

export interface CopilotAccessInfo {
  allowed: boolean
  used: number
  limit: number
  plan: 'free' | 'pro'
}

export async function checkCopilotAccess(): Promise<CopilotAccessInfo | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return canUseCopilot(user.id)
}

export async function checkInterviewHistory(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { count } = await supabase
    .from('interview_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
  
  return (count ?? 0) > 0
}

export async function sendChatMessage(
  question: string,
  _history: ChatMessage[],
  insightContext?: InsightContextData | null,
  heroContext?: HeroContextData | null,
  interviewContext?: InterviewContextData | null
): Promise<ChatResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Nao autenticado')
  }

  // ========== SECURITY CHECKS ==========
  
  // 1. Validar input (sanitização e detecção de injection)
  const inputValidation = validateInput(question)
  if (!inputValidation.valid) {
    return {
      message: inputValidation.reason || 'Mensagem inválida',
      isDirect: true,
    }
  }

  // 2. Verificar se o tópico é permitido
  const topicCheck = checkTopic(inputValidation.sanitized)
  if (!topicCheck.onTopic) {
    return {
      message: topicCheck.suggestedResponse || 'Sou focado em ajudar com sua carreira. Posso ajudar com suas aplicações, métricas, ou dicas de emprego?',
      isDirect: true,
    }
  }

  // Usar mensagem sanitizada daqui em diante
  const sanitizedQuestion = inputValidation.sanitized

  // ========== END SECURITY CHECKS ==========
  
  // Check copilot access
  const access = await canUseCopilot(user.id)
  if (!access.allowed) {
    return {
      message: 'Voce atingiu o limite de 5 perguntas por dia. Faca upgrade para o Pro para perguntas ilimitadas.',
      isDirect: true,
      limitReached: true,
    }
  }
  
  // Buscar contexto do usuario
  const context = await getUserContext()
  
  // Classificar e processar a query
  const result = handleQuery(sanitizedQuestion, context)
  
  if (result.type === 'direct') {
    // Resposta direta do DB - sem custo de IA, mas conta como uso
    await incrementCopilotUsage()
    return {
      message: result.response,
      isDirect: true,
    }
  }
  
  // Query complexa - usar AI provider
  const provider = getAIProvider()
  const systemPrompt = buildSystemPrompt(context, insightContext, heroContext, interviewContext)
  
  const aiResponse = await provider.complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: sanitizedQuestion },
  ])
  const response = aiResponse.content
  
  // Increment usage after successful response
  await incrementCopilotUsage()
  
  return {
    message: response,
    isDirect: false,
  }
}
