import { z } from 'zod'

export const applicationStatusSchema = z.enum([
  'aplicado',
  'em_analise',
  'entrevista',
  'proposta',
  'aceito',
  'rejeitado',
  'desistencia',
])

export const createApplicationSchema = z.object({
  company: z.string().min(1, 'Informe a empresa'),
  title: z.string().min(1, 'Informe o cargo'),
  url: z.string().url('URL invalida').optional().or(z.literal('')),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  job_description: z.string().optional(),
  notes: z.string().optional(),
})

export const updateApplicationSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, 'Informe a empresa'),
  title: z.string().min(1, 'Informe o cargo'),
  url: z.string().url('URL invalida').optional().or(z.literal('')),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  job_description: z.string().optional(),
  notes: z.string().optional(),
})

export const changeStatusSchema = z.object({
  id: z.string().uuid(),
  status: applicationStatusSchema,
  notes: z.string().optional(),
})

export const deleteApplicationSchema = z.object({
  id: z.string().uuid(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>
export type DeleteApplicationInput = z.infer<typeof deleteApplicationSchema>
