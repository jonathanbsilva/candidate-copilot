import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card } from '@ui/components'
import { ArrowLeft } from 'lucide-react'
import { getDashboardMetrics, getBenchmarkMetrics } from '../actions'
import { statusConfig } from '@/lib/types/application'
import { BenchmarkCard } from '../_components/benchmark-card'

export default async function MetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth')
  
  const metrics = await getDashboardMetrics()
  const benchmark = await getBenchmarkMetrics(metrics)

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-navy">
          Métricas da sua busca
        </h1>
      </div>

      {metrics.total === 0 ? (
        <Card className="p-4 sm:p-6">
          <p className="text-navy/70 mb-4">
            Adicione suas primeiras candidaturas para ver métricas da sua busca.
          </p>
          <Link href="/dashboard/aplicacoes/nova">
            <Button>Adicionar primeira candidatura</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Resumo */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Resumo da sua busca
            </h2>
            <div className="space-y-3">
              <MetricRow label="Total de vagas" value={metrics.total} />
              <MetricRow 
                label="Candidaturas" 
                value={(metrics.porStatus['aplicado'] || 0) + (metrics.porStatus['em_analise'] || 0)} 
              />
              <MetricRow label="Entrevistas" value={metrics.porStatus['entrevista'] || 0} />
              <MetricRow label="Ofertas" value={metrics.porStatus['proposta'] || 0} />
              <MetricRow label="Aceitas" value={metrics.porStatus['aceito'] || 0} />
              <MetricRow label="Rejeições" value={metrics.porStatus['rejeitado'] || 0} />
              <MetricRow label="Desistências" value={metrics.porStatus['desistencia'] || 0} />
            </div>
          </Card>

          {/* Distribuicao */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Distribuição por status
            </h2>
            <StatusDistribution 
              porStatus={metrics.porStatus} 
              total={metrics.total} 
            />
          </Card>

          {/* Benchmark */}
          <BenchmarkCard userMetrics={metrics} benchmark={benchmark} />
        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-stone/20 last:border-0">
      <span className="text-navy/70">{label}</span>
      <span className="text-navy font-semibold">{value}</span>
    </div>
  )
}

function StatusDistribution({ 
  porStatus, 
  total 
}: { 
  porStatus: Record<string, number>
  total: number 
}) {
  const statuses = Object.entries(statusConfig)
  
  return (
    <div className="space-y-3">
      {statuses.map(([status, config]) => {
        const count = porStatus[status] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0
        
        return (
          <div key={status}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy">{config.label}</span>
              <span className="text-navy/70">{count}</span>
            </div>
            <div className="h-2 bg-stone/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
