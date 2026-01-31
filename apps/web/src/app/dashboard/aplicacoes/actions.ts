'use server'

import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createApplicationSchema,
  updateApplicationSchema,
  changeStatusSchema,
  deleteApplicationSchema,
  type CreateApplicationInput,
  type UpdateApplicationInput,
  type ChangeStatusInput,
} from '@/lib/schemas/application'
import { canAddApplication } from '@/lib/subscription/check-access'
import { incrementApplicationUsage } from '@/lib/subscription/actions'
import { validateUUID } from '@/lib/schemas/uuid'
import { logger } from '@/lib/logger'

export async function createApplication(data: CreateApplicationInput) {
  const validated = createApplicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado' }
  }

  // Check application limit for free users
  const accessCheck = await canAddApplication(user.id)
  if (!accessCheck.allowed) {
    return { 
      error: 'Limite de vagas atingido. Faca upgrade para adicionar mais.', 
      limitReached: true 
    }
  }

  // Insert application
  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      company: validated.data.company,
      title: validated.data.title,
      url: validated.data.url || null,
      location: validated.data.location || null,
      salary_range: validated.data.salary_range || null,
      job_description: validated.data.job_description || null,
      notes: validated.data.notes || null,
      status: 'aplicado',
    })
    .select('id')
    .single()

  if (appError) {
    logger.error('Erro ao criar aplicação', { 
      error: appError.message, 
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Erro ao criar aplicação. Tente novamente.' }
  }

  // Create initial status history entry
  const { error: historyError } = await supabase
    .from('status_history')
    .insert({
      application_id: application.id,
      from_status: null,
      to_status: 'aplicado',
      notes: 'Aplicação criada',
    })

  if (historyError) {
    // Log mas não falha a operação (histórico é secundário)
    logger.warn('Erro ao criar histórico de status inicial', { 
      error: historyError.message, 
      applicationId: application.id,
      userId: user.id,
      feature: 'applications'
    })
  }

  // Increment monthly usage counter
  await incrementApplicationUsage()

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath('/dashboard')  // Atualizar stats do dashboard
  return { success: true, id: application.id }
}

export async function updateApplication(data: UpdateApplicationInput) {
  const validated = updateApplicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado' }
  }

  const { error } = await supabase
    .from('applications')
    .update({
      company: validated.data.company,
      title: validated.data.title,
      url: validated.data.url || null,
      location: validated.data.location || null,
      salary_range: validated.data.salary_range || null,
      job_description: validated.data.job_description || null,
      notes: validated.data.notes || null,
    })
    .eq('id', validated.data.id)
    .eq('user_id', user.id)

  if (error) {
    logger.error('Erro ao atualizar aplicação', { 
      error: error.message, 
      applicationId: validated.data.id,
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Erro ao atualizar aplicação. Tente novamente.' }
  }

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath(`/dashboard/aplicacoes/${validated.data.id}`)
  revalidatePath('/dashboard')  // Atualizar stats do dashboard
  return { success: true }
}

export async function deleteApplication(id: string) {
  const validated = deleteApplicationSchema.safeParse({ id })
  if (!validated.success) {
    return { error: 'ID invalido' }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado' }
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', validated.data.id)
    .eq('user_id', user.id)

  if (error) {
    logger.error('Erro ao excluir aplicação', { 
      error: error.message, 
      applicationId: validated.data.id,
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Erro ao excluir aplicação. Tente novamente.' }
  }

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath('/dashboard')  // Atualizar stats do dashboard
  return { success: true }
}

export async function changeStatus(data: ChangeStatusInput) {
  const validated = changeStatusSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado' }
  }

  // Get current status
  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('status')
    .eq('id', validated.data.id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentApp) {
    return { error: 'Aplicação não encontrada' }
  }

  // Update application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: validated.data.status })
    .eq('id', validated.data.id)
    .eq('user_id', user.id)

  if (updateError) {
    logger.error('Erro ao atualizar status', { 
      error: updateError.message, 
      applicationId: validated.data.id,
      newStatus: validated.data.status,
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Erro ao atualizar status. Tente novamente.' }
  }

  // Create status history entry
  const { error: historyError } = await supabase
    .from('status_history')
    .insert({
      application_id: validated.data.id,
      from_status: currentApp.status,
      to_status: validated.data.status,
      notes: validated.data.notes || null,
    })

  if (historyError) {
    // Log mas não falha a operação (histórico é secundário)
    logger.warn('Erro ao criar histórico de status', { 
      error: historyError.message, 
      applicationId: validated.data.id,
      fromStatus: currentApp.status,
      toStatus: validated.data.status,
      userId: user.id,
      feature: 'applications'
    })
  }

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath(`/dashboard/aplicacoes/${validated.data.id}`)
  revalidatePath('/dashboard')  // Atualizar stats do dashboard
  return { success: true }
}

export async function getApplications() {
  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Erro ao carregar aplicações', { 
      error: error.message, 
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Erro ao carregar aplicações', data: null }
  }

  return { data, error: null }
}

export async function getApplication(id: string) {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(id)
  if (!uuidValidation.success) {
    return { error: uuidValidation.error, data: null }
  }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Usuário não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', uuidValidation.data)
    .eq('user_id', user.id)
    .single()

  if (error) {
    logger.error('Erro ao buscar aplicação', { 
      error: error.message, 
      applicationId: uuidValidation.data,
      userId: user.id,
      feature: 'applications'
    })
    return { error: 'Aplicação não encontrada', data: null }
  }

  return { data, error: null }
}

export async function getStatusHistory(applicationId: string) {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(applicationId)
  if (!uuidValidation.success) {
    return { error: uuidValidation.error, data: null }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('application_id', uuidValidation.data)
    .order('changed_at', { ascending: false })

  if (error) {
    logger.error('Erro ao carregar histórico', { 
      error: error.message, 
      applicationId: uuidValidation.data,
      feature: 'applications'
    })
    return { error: 'Erro ao carregar historico', data: null }
  }

  return { data, error: null }
}

export async function getApplicationStats() {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return { total: 0, em_andamento: 0, propostas: 0 }
  }

  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user.id)

  if (error || !data) {
    return { total: 0, em_andamento: 0, propostas: 0 }
  }

  const total = data.length
  const em_andamento = data.filter(app => 
    ['aplicado', 'em_analise', 'entrevista'].includes(app.status)
  ).length
  const propostas = data.filter(app => 
    ['proposta', 'aceito'].includes(app.status)
  ).length

  return { total, em_andamento, propostas }
}

export interface DetailedStats {
  total: number
  aplicado: number
  emAnalise: number
  entrevista: number
  proposta: number
  aceito: number
  rejeitado: number
  desistencia: number
  em_andamento: number
  propostas: number
}

export async function getDetailedStats(): Promise<DetailedStats> {
  const { supabase, user } = await getAuthenticatedUser()

  const defaultStats: DetailedStats = {
    total: 0,
    aplicado: 0,
    emAnalise: 0,
    entrevista: 0,
    proposta: 0,
    aceito: 0,
    rejeitado: 0,
    desistencia: 0,
    em_andamento: 0,
    propostas: 0,
  }

  if (!user) {
    return defaultStats
  }

  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user.id)

  if (error || !data) {
    return defaultStats
  }

  const statusCounts = data.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const aplicado = statusCounts['aplicado'] || 0
  const emAnalise = statusCounts['em_analise'] || 0
  const entrevista = statusCounts['entrevista'] || 0
  const proposta = statusCounts['proposta'] || 0
  const aceito = statusCounts['aceito'] || 0
  const rejeitado = statusCounts['rejeitado'] || 0
  const desistencia = statusCounts['desistencia'] || 0

  return {
    total: data.length,
    aplicado,
    emAnalise,
    entrevista,
    proposta,
    aceito,
    rejeitado,
    desistencia,
    em_andamento: aplicado + emAnalise + entrevista,
    propostas: proposta + aceito,
  }
}

export async function checkApplicationAccess() {
  const { user } = await getAuthenticatedUser()
  if (!user) {
    return null
  }

  return canAddApplication(user.id)
}
