import Link from 'next/link'
import { Card, Badge, Button } from '@ui/components'
import { Sparkles, ArrowRight, Target, RefreshCw } from 'lucide-react'
import { objetivoLabels } from '@/lib/insight-engine'

interface InsightData {
  id: string
  recommendation: string
  objetivo?: string
  cargo?: string
  next_steps?: string[]
  created_at: string
}

interface StrategyCardProps {
  insight: InsightData | null
}

function getInsightAge(createdAt: string): { days: number; label: string; isStale: boolean } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const isStale = days > 14
  
  let label: string
  if (days === 0) {
    label = 'Hoje'
  } else if (days === 1) {
    label = 'Ontem'
  } else if (days < 7) {
    label = `${days} dias atras`
  } else if (days < 14) {
    label = '1 semana atras'
  } else if (days < 30) {
    label = `${Math.floor(days / 7)} semanas atras`
  } else {
    label = `${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''} atras`
  }
  
  return { days, label, isStale }
}

export function StrategyCard({ insight }: StrategyCardProps) {
  // Empty state
  if (!insight) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-amber" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy">
              Sua Estrategia
            </h2>
            <p className="text-sm text-navy/60">
              Defina seu proximo passo
            </p>
          </div>
        </div>
        
        <div className="text-center py-6">
          <p className="text-navy/60 text-sm mb-4">
            Responda algumas perguntas e receba uma estrategia personalizada para sua carreira.
          </p>
          <Link href="/comecar">
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Criar minha estrategia
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const age = getInsightAge(insight.created_at)
  const nextSteps = insight.next_steps?.slice(0, 4) || []

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-amber" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy">
              Sua Estrategia
            </h2>
            <p className="text-sm text-navy/60">
              {(insight.objetivo && objetivoLabels[insight.objetivo]) || insight.cargo || 'Recomendacao personalizada'}
            </p>
          </div>
        </div>
        <Badge variant={age.isStale ? 'warning' : 'info'}>
          {age.label}
        </Badge>
      </div>

      {/* Main recommendation */}
      <div className="bg-navy/5 rounded-lg p-4 mb-4">
        <p className="text-navy font-medium">
          {insight.recommendation}
        </p>
      </div>

      {/* Next steps - timeline */}
      {nextSteps.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-navy/70 mb-3">
            Proximos passos
          </h3>
          <div className="border-l-2 border-teal/30 pl-4 space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-teal/60" />
                <p className="text-sm text-navy/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-2 border-t border-stone/20">
        {age.isStale ? (
          <>
            <Link href="/comecar" className="flex-1">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar estrategia
              </Button>
            </Link>
            <Link href={`/dashboard/insights/${insight.id}`}>
              <Button variant="ghost" size="sm">
                Ver atual
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={`/dashboard/insights/${insight.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Ver detalhes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/comecar">
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer
              </Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  )
}
