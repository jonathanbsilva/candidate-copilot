import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@ui/components'
import { 
  ArrowLeft, Building2, MapPin, 
  Calendar, ExternalLink, DollarSign, FileText, 
  Clock
} from 'lucide-react'
import { getApplication, getStatusHistory } from '../actions'
import { StatusBadge } from '../_components/status-badge'
import { StatusTimeline } from './status-timeline'
import { ApplicationActions } from './application-actions'
import type { Application, StatusHistory } from '@/lib/types/application'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params

  const [applicationResult, historyResult] = await Promise.all([
    getApplication(id),
    getStatusHistory(id),
  ])

  if (applicationResult.error || !applicationResult.data) {
    notFound()
  }

  const application = applicationResult.data as Application
  const history = (historyResult.data || []) as StatusHistory[]

  const formattedDate = new Date(application.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Back link */}
      <Link 
        href="/dashboard/aplicacoes" 
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para lista
      </Link>

      {/* Application header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-navy/50" />
              <span className="text-navy/70">{application.company}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-navy">
              {application.title}
            </h1>
          </div>
          <StatusBadge status={application.status} className="text-sm px-3 py-1" />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-navy/60">
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {application.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Aplicado em {formattedDate}
          </span>
        </div>
      </div>

      {/* Actions */}
      <ApplicationActions 
        application={application} 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Detalhes</h2>
            
            <div className="space-y-4">
              {application.url && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-navy/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy/60 mb-1">Link da vaga</p>
                    <a 
                      href={application.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber hover:underline break-all"
                    >
                      {application.url}
                    </a>
                  </div>
                </div>
              )}

              {application.salary_range && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-navy/40 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy/60 mb-1">Faixa salarial</p>
                    <p className="text-navy">{application.salary_range}</p>
                  </div>
                </div>
              )}

              {application.job_description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-navy/40 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy/60 mb-1">Descrição da vaga</p>
                    <p className="text-navy whitespace-pre-wrap">{application.job_description}</p>
                  </div>
                </div>
              )}

              {!application.url && !application.salary_range && !application.job_description && (
                <p className="text-navy/50 text-sm">Nenhum detalhe adicional cadastrado.</p>
              )}
            </div>
          </Card>

          {/* Notes card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Notas Pessoais</h2>
            {application.notes ? (
              <p className="text-navy whitespace-pre-wrap">{application.notes}</p>
            ) : (
              <p className="text-navy/50 text-sm">Nenhuma nota adicionada.</p>
            )}
          </Card>
        </div>

        {/* Timeline sidebar */}
        <div>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-navy/50" />
              <h2 className="text-lg font-semibold text-navy">Historico</h2>
            </div>
            <StatusTimeline history={history} />
          </Card>
        </div>
      </div>
    </div>
  )
}
