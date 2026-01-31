import { Card } from '@ui/components'

/**
 * Skeleton primitivo com animação de pulse
 */
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-stone/20 rounded ${className}`} />
}

/**
 * Skeleton do HeroCard
 */
export function HeroCardSkeleton() {
  return (
    <Card variant="elevated" className="p-4 sm:p-6 bg-gradient-to-r from-teal/5 to-amber/5 border-teal/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Message */}
      <div className="space-y-2 mb-5 pr-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </Card>
  )
}

/**
 * Skeleton do StrategyCard
 */
export function StrategyCardSkeleton() {
  return (
    <Card variant="elevated" className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Main recommendation */}
      <div className="bg-navy/5 rounded-lg p-4 mb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Next steps */}
      <div className="mb-4">
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="border-l-2 border-stone/20 pl-4 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-2 border-t border-stone/20">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  )
}

/**
 * Skeleton do card de Aplicações no dashboard
 */
export function ApplicationsCardSkeleton() {
  return (
    <Card variant="elevated" className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      
      {/* Mini chart skeleton */}
      <div className="mt-4 pt-4 border-t border-stone/20">
        <div className="flex items-end justify-between gap-2 h-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <Skeleton className="w-full max-w-8 h-6 rounded-t" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton do card de Entrevista IA no dashboard
 */
export function InterviewCardSkeleton() {
  return (
    <Card variant="elevated" className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-28 mb-1" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </Card>
  )
}

/**
 * Skeleton para a lista de aplicações
 */
export function ApplicationsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="w-5 h-5 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Skeleton para stats boxes e funil
 */
export function StatsAndFunnelSkeleton() {
  return (
    <>
      {/* Stats boxes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-stone/10 rounded-lg p-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Funnel skeleton */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="flex-1 h-6 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
