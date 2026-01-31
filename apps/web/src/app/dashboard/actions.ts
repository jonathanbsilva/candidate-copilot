'use server'

import { createClient } from '@/lib/supabase/server'
import { detectContext, buildMessage, type HeroData, type UserDataForHero } from '@/lib/hero'
import type { Application } from '@/lib/types/application'

export interface DashboardMetrics {
  total: number
  porStatus: Record<string, number>
  taxaConversao: number
  processosAtivos: number
  aguardandoResposta: number
  ofertas: number
}

export interface BenchmarkMetrics {
  taxaConversaoMedia: number
  processosAtivosMedia: number
  totalUsuariosAtivos: number
  percentilUsuario: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      total: 0,
      porStatus: {},
      taxaConversao: 0,
      processosAtivos: 0,
      aguardandoResposta: 0,
      ofertas: 0,
    }
  }
  
  const { data: applications } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user.id)
  
  if (!applications || applications.length === 0) {
    return {
      total: 0,
      porStatus: {},
      taxaConversao: 0,
      processosAtivos: 0,
      aguardandoResposta: 0,
      ofertas: 0,
    }
  }
  
  // Contar por status
  const porStatus: Record<string, number> = {}
  applications.forEach(app => {
    porStatus[app.status] = (porStatus[app.status] || 0) + 1
  })
  
  const total = applications.length
  const entrevistas = porStatus['entrevista'] || 0
  const propostas = porStatus['proposta'] || 0
  const aplicados = porStatus['aplicado'] || 0
  const emAnalise = porStatus['em_analise'] || 0
  
  return {
    total,
    porStatus,
    taxaConversao: total > 0 ? Math.round((entrevistas / total) * 100) : 0,
    processosAtivos: entrevistas + propostas,
    aguardandoResposta: aplicados + emAnalise,
    ofertas: propostas,
  }
}

export async function getBenchmarkMetrics(
  userMetrics: DashboardMetrics
): Promise<BenchmarkMetrics | null> {
  const supabase = await createClient()
  
  // Buscar metricas agregadas de todos os usuarios
  const { data: allApplications } = await supabase
    .from('applications')
    .select('user_id, status')
  
  if (!allApplications || allApplications.length < 50) {
    // Minimo de dados para benchmark anonimo
    return null
  }
  
  // Agrupar por usuario
  const userStats = new Map<string, { total: number; entrevistas: number }>()
  
  allApplications.forEach(app => {
    const stats = userStats.get(app.user_id) || { total: 0, entrevistas: 0 }
    stats.total++
    if (app.status === 'entrevista' || app.status === 'proposta') {
      stats.entrevistas++
    }
    userStats.set(app.user_id, stats)
  })
  
  // Calcular media de taxa de conversao
  const taxas = Array.from(userStats.values())
    .filter(s => s.total >= 3) // Minimo 3 aplicacoes
    .map(s => (s.entrevistas / s.total) * 100)
  
  if (taxas.length < 10) {
    // Minimo de 10 usuarios para mostrar benchmark
    return null
  }
  
  const taxaConversaoMedia = taxas.length > 0 
    ? Math.round(taxas.reduce((a, b) => a + b, 0) / taxas.length)
    : 0
  
  // Calcular media de processos ativos
  const processosAtivosArray = Array.from(userStats.values())
    .filter(s => s.total >= 3)
    .map(s => s.entrevistas)
  
  const processosAtivosMedia = processosAtivosArray.length > 0
    ? Math.round((processosAtivosArray.reduce((a, b) => a + b, 0) / processosAtivosArray.length) * 10) / 10
    : 0
  
  // Calcular percentil do usuario
  const userTaxa = userMetrics.taxaConversao
  const abaixo = taxas.filter(t => t < userTaxa).length
  const percentilUsuario = Math.round((abaixo / taxas.length) * 100)
  
  return {
    taxaConversaoMedia,
    processosAtivosMedia,
    totalUsuariosAtivos: userStats.size,
    percentilUsuario,
  }
}

export async function getHeroData(hasPendingInsight: boolean = false): Promise<HeroData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Paralelizar as 3 queries independentes para reduzir latência
  const [
    { data: applications },
    { data: insights },
    { data: recentInterview },
  ] = await Promise.all([
    // Buscar aplicacoes do usuario
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    // Buscar insights do usuario
    supabase
      .from('insights')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    // Buscar entrevista simulada recente (Pro users)
    supabase
      .from('interview_sessions')
      .select('id, cargo, area, overall_score, feedback, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const userData: UserDataForHero = {
    applications: (applications || []) as Application[],
    insights: insights || [],
    hasPendingInsight,
    recentInterviewSession: recentInterview || null,
  }

  // Detectar contexto e construir mensagem
  const contextResult = detectContext(userData)
  const heroData = await buildMessage(contextResult, user.id)

  return heroData
}
