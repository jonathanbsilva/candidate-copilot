'use server'

import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { InterviewContextBuilder, FeedbackContextBuilder } from '@/lib/ai/context/interview'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Types
export type InterviewSession = {
  id: string
  user_id: string
  cargo: string
  area: string | null
  senioridade: string | null
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

// Criar nova sessao
export async function createInterviewSession(data: {
  cargo: string
  area?: string
  senioridade?: string
}): Promise<{ session?: InterviewSession; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verificar acesso Pro
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return { error: 'Entrevista IA requer plano Pro' }
  }

  // Gerar primeira pergunta
  const provider = getAIProvider()
  const contextBuilder = new InterviewContextBuilder({
    cargo: data.cargo,
    area: data.area,
    senioridade: data.senioridade,
    questionNumber: 1,
  })

  const response = await provider.complete(contextBuilder.build(''))
  const firstQuestion = response.content.trim()

  // Criar sessao
  const { data: session, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: user.id,
      cargo: data.cargo,
      area: data.area || null,
      senioridade: data.senioridade || null,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Buscar sessao
  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
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

  revalidatePath(`/interview-pro/resultado/${sessionId}`)

  return { completed: true, feedback }
}

// Buscar sessao
export async function getSession(sessionId: string): Promise<InterviewSession | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  return data
}

// Listar historico
export async function getInterviewHistory(): Promise<InterviewSession[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

// Verificar acesso à Entrevista IA
export async function checkInterviewAccess(): Promise<{
  allowed: boolean
  plan: 'free' | 'pro' | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, plan: null }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return {
    allowed: profile?.plan === 'pro',
    plan: profile?.plan || 'free'
  }
}

// Buscar ultimo insight do usuario para pre-preencher
export async function getLastInsightData(): Promise<{
  cargo?: string
  area?: string
  senioridade?: string
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

// Abandonar sessao
export async function abandonSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'abandoned',
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
