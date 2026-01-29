'use client'

import { statusConfig, type StatusHistory, type ApplicationStatus } from '@/lib/types/application'

interface StatusTimelineProps {
  history: StatusHistory[]
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-navy/50 text-sm">Nenhum historico de status ainda.</p>
    )
  }

  return (
    <div className="relative">
      {history.map((entry, index) => {
        const config = statusConfig[entry.to_status as ApplicationStatus]
        const formattedDate = new Date(entry.changed_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        const formattedTime = new Date(entry.changed_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const isLast = index === history.length - 1

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%-12px)] bg-stone/30" />
            )}
            
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                index === 0 
                  ? 'border-amber bg-amber/20' 
                  : 'border-stone/50 bg-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-amber' : 'bg-stone/50'
                }`} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  config.variant === 'success' ? 'bg-teal/20 text-teal' :
                  config.variant === 'warning' ? 'bg-amber/20 text-amber' :
                  config.variant === 'error' ? 'bg-red-100 text-red-700' :
                  config.variant === 'info' ? 'bg-blue-100 text-blue-700' :
                  'bg-stone/30 text-navy'
                }`}>
                  {config.label}
                </span>
                <span className="text-sm text-navy/50">
                  {formattedDate} as {formattedTime}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-navy/70 mt-1">
                  &ldquo;{entry.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
