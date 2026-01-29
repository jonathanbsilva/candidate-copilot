export type ApplicationStatus = 
  | 'aplicado' 
  | 'em_analise' 
  | 'entrevista' 
  | 'proposta' 
  | 'aceito' 
  | 'rejeitado' 
  | 'desistencia'

export interface Application {
  id: string
  user_id: string
  company: string
  title: string
  status: ApplicationStatus
  notes: string | null
  job_description: string | null
  url: string | null
  salary_range: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface StatusHistory {
  id: string
  application_id: string
  from_status: ApplicationStatus | null
  to_status: ApplicationStatus
  changed_at: string
  notes: string | null
}

export const statusConfig: Record<ApplicationStatus, { 
  label: string
  variant: 'default' | 'info' | 'success' | 'warning' | 'error' 
}> = {
  aplicado: { label: 'Aplicado', variant: 'default' },
  em_analise: { label: 'Em Analise', variant: 'info' },
  entrevista: { label: 'Entrevista', variant: 'info' },
  proposta: { label: 'Proposta', variant: 'success' },
  aceito: { label: 'Aceito', variant: 'success' },
  rejeitado: { label: 'Rejeitado', variant: 'error' },
  desistencia: { label: 'Desistencia', variant: 'warning' },
}

export const statusOptions = [
  { value: 'aplicado', label: 'Aplicado' },
  { value: 'em_analise', label: 'Em Analise' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'aceito', label: 'Aceito' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'desistencia', label: 'Desistencia' },
] as const
