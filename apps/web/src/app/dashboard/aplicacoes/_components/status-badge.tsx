'use client'

import { Badge } from '@ui/components'
import { statusConfig, type ApplicationStatus } from '@/lib/types/application'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
