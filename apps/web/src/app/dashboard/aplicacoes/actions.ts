'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function createApplication(data: CreateApplicationInput) {
  const validated = createApplicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado' }
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
    console.error('Error creating application:', appError)
    return { error: 'Erro ao criar aplicacao. Tente novamente.' }
  }

  // Create initial status history entry
  const { error: historyError } = await supabase
    .from('status_history')
    .insert({
      application_id: application.id,
      from_status: null,
      to_status: 'aplicado',
      notes: 'Aplicacao criada',
    })

  if (historyError) {
    console.error('Error creating status history:', historyError)
  }

  revalidatePath('/dashboard/aplicacoes')
  return { success: true, id: application.id }
}

export async function updateApplication(data: UpdateApplicationInput) {
  const validated = updateApplicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado' }
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
    console.error('Error updating application:', error)
    return { error: 'Erro ao atualizar aplicacao. Tente novamente.' }
  }

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath(`/dashboard/aplicacoes/${validated.data.id}`)
  return { success: true }
}

export async function deleteApplication(id: string) {
  const validated = deleteApplicationSchema.safeParse({ id })
  if (!validated.success) {
    return { error: 'ID invalido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado' }
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', validated.data.id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting application:', error)
    return { error: 'Erro ao excluir aplicacao. Tente novamente.' }
  }

  revalidatePath('/dashboard/aplicacoes')
  return { success: true }
}

export async function changeStatus(data: ChangeStatusInput) {
  const validated = changeStatusSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message || 'Dados invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado' }
  }

  // Get current status
  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('status')
    .eq('id', validated.data.id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentApp) {
    return { error: 'Aplicacao nao encontrada' }
  }

  // Update application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: validated.data.status })
    .eq('id', validated.data.id)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Error updating status:', updateError)
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
    console.error('Error creating status history:', historyError)
  }

  revalidatePath('/dashboard/aplicacoes')
  revalidatePath(`/dashboard/aplicacoes/${validated.data.id}`)
  return { success: true }
}

export async function getApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return { error: 'Erro ao carregar aplicacoes', data: null }
  }

  return { data, error: null }
}

export async function getApplication(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario nao autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching application:', error)
    return { error: 'Aplicacao nao encontrada', data: null }
  }

  return { data, error: null }
}

export async function getStatusHistory(applicationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: false })

  if (error) {
    console.error('Error fetching status history:', error)
    return { error: 'Erro ao carregar historico', data: null }
  }

  return { data, error: null }
}

export async function getApplicationStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
