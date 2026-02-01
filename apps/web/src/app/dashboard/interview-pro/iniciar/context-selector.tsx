'use client'

import { Card, Badge } from '@ui/components'
import { Briefcase, Sparkles, Edit3, ChevronRight } from 'lucide-react'
import type { ActiveApplication } from '../actions'

export type ContextOption = 'job' | 'insight' | 'manual'

export type ContextData = {
  source: ContextOption
  cargo?: string
  area?: string
  senioridade?: string
  company?: string
  jobTitle?: string
  applicationId?: string
}

type InsightData = {
  cargo?: string
  area?: string
  senioridade?: string
}

interface ContextSelectorProps {
  applications: ActiveApplication[]
  lastInsight: InsightData | null
  onSelect: (option: ContextOption, data?: ContextData) => void
}

const areaLabels: Record<string, string> = {
  tecnologia: 'Tecnologia',
  tech: 'Tecnologia', // alias
  marketing: 'Marketing',
  vendas: 'Vendas',
  financas: 'Finanças',
  rh: 'RH',
  operacoes: 'Operações',
  produto: 'Produto',
  design: 'Design',
  outro: 'Outro',
}

const senioridadeLabels: Record<string, string> = {
  estagio: 'Estágio',
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  lideranca: 'Liderança',
}

export function ContextSelector({ applications, lastInsight, onSelect }: ContextSelectorProps) {
  const hasApplications = applications.length > 0
  const hasInsight = lastInsight && lastInsight.cargo

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/60 mb-4">
        Como você quer se preparar hoje?
      </p>

      {/* Option 1: Job Applications - Each as its own card */}
      {hasApplications && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-navy/50 uppercase tracking-wide px-1">
            Suas vagas em aberto
          </p>
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelect('job', {
                source: 'job',
                company: app.company,
                jobTitle: app.title,
                applicationId: app.id,
              })}
              className="w-full text-left group"
            >
              <Card className="p-4 hover:border-teal/50 transition-colors cursor-pointer group-hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-navy truncate">{app.title}</h3>
                      <ChevronRight className="w-4 h-4 text-navy/30 group-hover:text-teal transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-sm text-navy/60 mt-0.5 truncate">
                      {app.company}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Divider if has applications and insight */}
      {hasApplications && hasInsight && (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone/30" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-navy/40">ou</span>
          </div>
        </div>
      )}

      {/* Option 2: Last Insight */}
      {hasInsight && (
        <button
          onClick={() => onSelect('insight', {
            source: 'insight',
            cargo: lastInsight.cargo,
            area: lastInsight.area,
            senioridade: lastInsight.senioridade,
          })}
          className="w-full text-left group"
        >
          <Card className="p-4 hover:border-amber/50 transition-colors cursor-pointer group-hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-navy">Usar última análise</h3>
                  <ChevronRight className="w-4 h-4 text-navy/30 group-hover:text-amber transition-colors flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge className="text-xs">{lastInsight.cargo}</Badge>
                  {lastInsight.senioridade && (
                    <Badge variant="info" className="text-xs">
                      {senioridadeLabels[lastInsight.senioridade] || lastInsight.senioridade}
                    </Badge>
                  )}
                  {lastInsight.area && (
                    <Badge variant="info" className="text-xs">
                      {areaLabels[lastInsight.area] || lastInsight.area}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </button>
      )}

      {/* Divider before manual */}
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone/30" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-navy/40">ou</span>
        </div>
      </div>

      {/* Option 3: Manual Entry */}
      <div>
        <button
          onClick={() => onSelect('manual')}
          className="w-full text-left group"
        >
          <Card className="p-4 hover:border-stone/50 transition-colors cursor-pointer group-hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-stone/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Edit3 className="w-5 h-5 text-navy/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-navy">Preencher manualmente</h3>
                  <ChevronRight className="w-4 h-4 text-navy/30 group-hover:text-navy/60 transition-colors flex-shrink-0" />
                </div>
                <p className="text-sm text-navy/60 mt-0.5">
                  Informe cargo, área e senioridade
                </p>
              </div>
            </div>
          </Card>
        </button>
      </div>
    </div>
  )
}
