'use server'

import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { InterviewContextBuilder, FeedbackContextBuilder } from '@/lib/ai/context/interview'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canUseInterviewPro } from '@/lib/subscription/check-access'
import { incrementInterviewUsage } from '@/lib/subscription/actions'
import { validateUUID } from '@/lib/schemas/uuid'
import { logger } from '@/lib/logger'
import { trackAIUsage } from '@/lib/ai/usage-tracker'

// Types
export type InterviewSession = {
  id: string
  user_id: string
  cargo: string
  area: string | null
  senioridade: string | null
  company: string | null
  source: 'job' | 'insight' | 'manual' | null
  application_id: string | null
  status: 'in_progress' | 'completed' | 'abandoned'
  questions: string[]
  answers: string[]
  feedback: InterviewFeedback | null
  overall_score: number | null
  created_at: string
  completed_at: string | null
}

export type InterviewFeedback = {
  overall_score: number
  summary: string
  per_question: Array<{
    question_number: number
    score: number
    strengths: string[]
    improvements: string[]
    tip: string
  }>
  general_tips: string[]
}

// Waitlist schema
const waitlistSchema = z.object({
  email: z.string().email('Email invalido'),
  source: z.string().optional(),
})

export async function joinWaitlist(formData: FormData) {
  const email = formData.get('email')
  const source = formData.get('source') || 'direct'

  const validated = waitlistSchema.safeParse({ email, source })
  if (!validated.success) {
    return { error: 'Email invalido' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({
      email: validated.data.email,
      feature: 'interview-pro',
      source: validated.data.source,
    })

  if (error?.code === '23505') {
    return { error: 'Este email ja esta na lista!' }
  }
  if (error) {
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  return { success: true }
}

// Context source type
export type ContextSource = 'job' | 'insight' | 'manual'

// Criar nova sessao
export async function createInterviewSession(data: {
  cargo: string
  area?: string
  senioridade?: string
  company?: string
  source?: ContextSource
  applicationId?: string
}): Promise<{ session?: InterviewSession; error?: string }> {
  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { error: authError || 'Not authenticated' }

  // Verificar acesso (Pro ilimitado ou Free com trial disponivel)
  const access = await canUseInterviewPro(user.id)

  if (!access.allowed) {
    return { error: 'Você já usou sua entrevista de teste. Faça upgrade para Pro.' }
  }

  // Gerar primeira pergunta com contexto enriquecido
  const provider = getAIProvider()
  const contextBuilder = new InterviewContextBuilder({
    cargo: data.cargo,
    area: data.area,
    senioridade: data.senioridade,
    company: data.company,
    questionNumber: 1,
  })

  const response = await provider.complete(contextBuilder.build(''))
  const firstQuestion = response.content.trim()

  // Track AI usage
  if (response.usage) {
    await trackAIUsage(user.id, 'interview_question', response.model, response.usage)
  }

  // Criar sessao com contexto enriquecido
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: user.id,
      cargo: data.cargo,
      area: data.area || null,
      senioridade: data.senioridade || null,
      company: data.company || null,
      source: data.source || 'manual',
      application_id: data.applicationId || null,
      questions: [firstQuestion],
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { session }
}

// Enviar resposta e obter proxima pergunta
export async function submitAnswer(sessionId: string, answer: string): Promise<{
  nextQuestion?: string
  questionNumber?: number
  completed?: boolean
  feedback?: InterviewFeedback
  error?: string
}> {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(sessionId)
  if (!uuidValidation.success) {
    return { error: uuidValidation.error }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { error: authError || 'Not authenticated' }

  // Buscar sessao
  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', uuidValidation.data)
    .eq('user_id', user.id)
    .single()

  if (!session) return { error: 'Session not found' }

  const currentAnswers = [...(session.answers || []), answer]
  const currentQuestions = session.questions || []
  const questionNumber = currentQuestions.length + 1

  // Se ja tem 3 respostas, gerar feedback
  if (currentAnswers.length >= 3) {
    return generateFeedback(sessionId, currentQuestions, currentAnswers, session)
  }

  // Gerar proxima pergunta
  const provider = getAIProvider()
  const previousQA = currentQuestions.map((q: string, i: number) => ({
    question: q,
    answer: currentAnswers[i] || '',
  }))

  const contextBuilder = new InterviewContextBuilder({
    cargo: session.cargo,
    area: session.area,
    senioridade: session.senioridade,
    questionNumber,
    previousQA,
  })

  const response = await provider.complete(contextBuilder.build(''))
  const nextQuestion = response.content.trim()

  // Track AI usage
  if (response.usage) {
    await trackAIUsage(user.id, 'interview_question', response.model, response.usage)
  }

  // Atualizar sessao
  await supabase
    .from('interview_sessions')
    .update({
      questions: [...currentQuestions, nextQuestion],
      answers: currentAnswers,
    })
    .eq('id', sessionId)

  revalidatePath(`/interview-pro/sessao/${sessionId}`)

  return { nextQuestion, questionNumber }
}

// Gerar feedback final
async function generateFeedback(
  sessionId: string,
  questions: string[],
  answers: string[],
  session: InterviewSession
): Promise<{ completed: boolean; feedback: InterviewFeedback; error?: string }> {
  const supabase = await createClient()
  const provider = getAIProvider()

  const qa = questions.map((q, i) => ({ question: q, answer: answers[i] }))

  const contextBuilder = new FeedbackContextBuilder({
    cargo: session.cargo,
    area: session.area || undefined,
    qa,
  })

  const response = await provider.complete(contextBuilder.build(''), {
    temperature: 0.3, // Mais consistente para JSON
  })

  // Track AI usage
  if (response.usage) {
    await trackAIUsage(session.user_id, 'interview_feedback', response.model, response.usage)
  }

  let feedback: InterviewFeedback
  try {
    feedback = JSON.parse(response.content)
  } catch {
    feedback = { 
      overall_score: 70, 
      summary: response.content, 
      per_question: [], 
      general_tips: [] 
    }
  }

  // Atualizar sessao como completa
  await supabase
    .from('interview_sessions')
    .update({
      answers,
      feedback,
      overall_score: feedback.overall_score,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  // Incrementar contador de entrevistas usadas (para controle do trial)
  await incrementInterviewUsage()

  revalidatePath(`/interview-pro/resultado/${sessionId}`)

  return { completed: true, feedback }
}

// Buscar sessao
export async function getSession(sessionId: string): Promise<InterviewSession | null> {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(sessionId)
  if (!uuidValidation.success) {
    return null
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return null

  const { data } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', uuidValidation.data)
    .eq('user_id', user.id)
    .single()

  return data
}

// Listar historico
export async function getInterviewHistory(): Promise<InterviewSession[]> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return []

  const { data } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  return data || []
}

// Verificar acesso ao Interview Pro
export async function checkInterviewAccess(): Promise<{
  allowed: boolean
  plan: 'free' | 'pro' | null
  isTrialAvailable: boolean
}> {
  const { user } = await getAuthenticatedUser()
  if (!user) return { allowed: false, plan: null, isTrialAvailable: false }

  const access = await canUseInterviewPro(user.id)

  return {
    allowed: access.allowed,
    plan: access.plan,
    isTrialAvailable: access.isTrialAvailable
  }
}

// Buscar ultimo insight do usuario para pre-preencher
export async function getLastInsightData(): Promise<{
  cargo?: string
  area?: string
  senioridade?: string
} | null> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return null

  const { data } = await supabase
    .from('insights')
    .select('cargo, area, senioridade')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

// Obter stats de entrevistas para o dashboard
export async function getInterviewStats(): Promise<{
  plan: 'free' | 'pro'
  totalSessions: number
  averageScore: number | null
  lastScore: number | null
  lastSessionDate: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  
  if (!user) {
    return { plan: 'free', totalSessions: 0, averageScore: null, lastScore: null, lastSessionDate: null }
  }

  // Verificar plano
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan = (profile?.plan as 'free' | 'pro') || 'free'

  // Buscar sessoes completadas (todos usuarios, incluindo Free com trial)
  const { data: sessions } = await supabase
    .from('interview_sessions')
    .select('overall_score, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return { plan, totalSessions: 0, averageScore: null, lastScore: null, lastSessionDate: null }
  }

  const scores = sessions.map(s => s.overall_score).filter((s): s is number => s !== null)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const lastScore = sessions[0]?.overall_score || null
  const lastSessionDate = sessions[0]?.completed_at || null

  return {
    plan,
    totalSessions: sessions.length,
    averageScore,
    lastScore,
    lastSessionDate,
  }
}

// Abandonar sessao
export async function abandonSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(sessionId)
  if (!uuidValidation.success) {
    return { success: false, error: uuidValidation.error }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { success: false, error: authError || 'Not authenticated' }

  const { error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'abandoned',
    })
    .eq('id', uuidValidation.data)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// Buscar aplicacoes ativas do usuario para contextualizacao
export type ActiveApplication = {
  id: string
  company: string
  title: string
  status: string
}

export async function getUserApplications(): Promise<ActiveApplication[]> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return []

  // Apenas vagas em aberto (status ativos), limitado a 3
  const { data } = await supabase
    .from('applications')
    .select('id, company, title, status')
    .eq('user_id', user.id)
    .in('status', ['aplicado', 'em_analise', 'entrevista'])
    .order('created_at', { ascending: false })
    .limit(3)

  return data || []
}
