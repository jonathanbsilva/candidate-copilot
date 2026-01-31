import { Card, Badge } from '@ui/components'
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DashboardMetrics, BenchmarkMetrics } from '../actions'

interface BenchmarkCardProps {
  userMetrics: DashboardMetrics
  benchmark: BenchmarkMetrics | null
}

export function BenchmarkCard({ userMetrics, benchmark }: BenchmarkCardProps) {
  if (!benchmark) {
    return null // Não mostrar se não tiver dados suficientes
  }
  
  const diff = userMetrics.taxaConversao - benchmark.taxaConversaoMedia
  const isAbove = diff > 0
  const isEqual = diff === 0
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-teal" />
        <h3 className="font-semibold text-navy">Como você se compara</h3>
        <Badge variant="info" className="ml-auto">Beta</Badge>
      </div>
      
      <div className="space-y-4">
        {/* Taxa de conversão comparativa */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-navy/70">Sua taxa de conversão</p>
            <p className="text-2xl font-bold text-navy">
              {userMetrics.taxaConversao}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-navy/70">Média da plataforma</p>
            <p className="text-2xl font-bold text-navy/50">
              {benchmark.taxaConversaoMedia}%
            </p>
          </div>
        </div>
        
        {/* Indicador visual */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isAbove ? 'bg-teal/10' : isEqual ? 'bg-stone/10' : 'bg-amber/10'
        }`}>
          {isAbove ? (
            <TrendingUp className="w-5 h-5 text-teal" />
          ) : isEqual ? (
            <Minus className="w-5 h-5 text-navy/50" />
          ) : (
            <TrendingDown className="w-5 h-5 text-amber" />
          )}
          <p className={`text-sm font-medium ${
            isAbove ? 'text-teal' : isEqual ? 'text-navy/70' : 'text-amber'
          }`}>
            {isAbove 
              ? `Você está ${Math.abs(diff)}% acima da média!`
              : isEqual 
              ? 'Você está na média'
              : `${Math.abs(diff)}% abaixo da média - continue aplicando!`
            }
          </p>
        </div>
        
        {/* Percentil */}
        {benchmark.percentilUsuario > 0 && (
          <p className="text-xs text-navy/50 text-center">
            Você está no top {100 - benchmark.percentilUsuario}% dos usuários
          </p>
        )}
      </div>
    </Card>
  )
}
