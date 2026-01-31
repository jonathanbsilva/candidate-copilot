'use client'

import { Card } from '@ui/components'
import { TrendingDown, TrendingUp } from 'lucide-react'

export interface FunnelData {
  aplicado: number
  emAnalise: number
  entrevista: number
  proposta: number
  aceito: number
  rejeitado: number
  desistencia: number
  total: number
}

interface ApplicationFunnelProps {
  data: FunnelData
}

const funnelStages = [
  { key: 'aplicado', label: 'Aplicado', color: 'bg-stone/40', textColor: 'text-navy/70' },
  { key: 'emAnalise', label: 'Em Analise', color: 'bg-blue-400', textColor: 'text-blue-700' },
  { key: 'entrevista', label: 'Entrevista', color: 'bg-amber', textColor: 'text-amber' },
  { key: 'proposta', label: 'Proposta', color: 'bg-teal', textColor: 'text-teal' },
] as const

export function ApplicationFunnel({ data }: ApplicationFunnelProps) {
  // Se nao tem dados, nao renderiza
  if (data.total === 0) return null

  // Calcula a largura proporcional de cada barra
  const maxValue = Math.max(
    data.aplicado,
    data.emAnalise,
    data.entrevista,
    data.proposta
  )

  // Taxa de conversao: propostas + aceitos / total
  const conversions = data.proposta + data.aceito
  const taxaConversao = data.total > 0 ? (conversions / data.total) * 100 : 0

  // Taxa de rejeicao
  const rejections = data.rejeitado + data.desistencia
  const taxaRejeicao = data.total > 0 ? (rejections / data.total) * 100 : 0

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-navy/70">Funil de Conversao</h3>
        <div className="flex items-center gap-4 text-xs">
          {taxaConversao > 0 && (
            <span className="flex items-center gap-1 text-teal">
              <TrendingUp className="w-3 h-3" />
              {taxaConversao.toFixed(0)}% conversão
            </span>
          )}
          {taxaRejeicao > 0 && (
            <span className="flex items-center gap-1 text-navy/50">
              <TrendingDown className="w-3 h-3" />
              {taxaRejeicao.toFixed(0)}% encerradas
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {funnelStages.map((stage) => {
          const value = data[stage.key as keyof FunnelData] as number
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="w-20 text-xs text-navy/60 text-right flex-shrink-0">
                {stage.label}
              </div>
              <div className="flex-1 h-6 bg-stone/10 rounded-md overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-md transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(percentage, value > 0 ? 8 : 0)}%` }}
                >
                  {value > 0 && (
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda de status finais */}
      {(data.aceito > 0 || data.rejeitado > 0 || data.desistencia > 0) && (
        <div className="mt-4 pt-3 border-t border-stone/20 flex items-center gap-4 text-xs text-navy/50">
          {data.aceito > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal" />
              {data.aceito} aceita{data.aceito > 1 ? 's' : ''}
            </span>
          )}
          {data.rejeitado > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {data.rejeitado} rejeitada{data.rejeitado > 1 ? 's' : ''}
            </span>
          )}
          {data.desistencia > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone/40" />
              {data.desistencia} desistencia{data.desistencia > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
