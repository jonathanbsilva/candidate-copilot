'use client'

import Link from 'next/link'
import { Card } from '@ui/components'
import { Building2, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { StatusBadge } from './status-badge'
import type { Application } from '@/lib/types/application'

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const formattedDate = new Date(application.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link href={`/dashboard/aplicacoes/${application.id}`}>
      <Card className="p-4 hover:border-amber/50 hover:shadow-medium transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-navy/50 flex-shrink-0" />
              <span className="text-sm text-navy/70 truncate">{application.company}</span>
            </div>
            <h3 className="text-lg font-semibold text-navy mb-2 truncate">
              {application.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-navy/60">
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {application.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={application.status} />
            <ChevronRight className="w-5 h-5 text-navy/30 group-hover:text-amber transition-colors" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
