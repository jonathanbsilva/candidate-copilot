import { Card } from '@ui/components'
import { TrendingUp, Target, Clock, Gift } from 'lucide-react'
import type { DashboardMetrics } from '../actions'

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      icon: TrendingUp,
      value: `${metrics.taxaConversao}%`,
      label: 'Taxa de conversão',
      description: 'Das candidaturas viraram entrevistas',
      bgColor: 'bg-teal/10',
      iconColor: 'text-teal',
    },
    {
      icon: Target,
      value: metrics.processosAtivos,
      label: 'Processos ativos',
      description: 'Entrevistas em andamento',
      bgColor: 'bg-amber/10',
      iconColor: 'text-amber',
    },
    {
      icon: Clock,
      value: metrics.aguardandoResposta,
      label: 'Aguardando resposta',
      description: 'Candidaturas sem retorno',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Gift,
      value: metrics.ofertas,
      label: 'Ofertas recebidas',
      description: 'Propostas de emprego',
      bgColor: 'bg-teal/10',
      iconColor: 'text-teal',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-3 sm:p-4">
          <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-navy mb-1">
            {card.value}
          </p>
          <p className="text-sm font-medium text-navy">
            {card.label}
          </p>
          <p className="text-xs text-navy/60 mt-1">
            {card.description}
          </p>
        </Card>
      ))}
    </div>
  )
}
