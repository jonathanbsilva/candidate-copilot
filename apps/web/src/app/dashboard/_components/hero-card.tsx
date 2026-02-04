'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { Card, Button } from '@ui/components'
import { X, Sparkles } from 'lucide-react'
import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'
import type { HeroData } from '@/lib/hero'

interface HeroCardProps {
  data: HeroData
  onDismiss?: () => void
}

export function HeroCard({ data, onDismiss }: HeroCardProps) {
  const { openWithHeroContext } = useCopilotDrawer()

  const handleOpenCopilot = useCallback(() => {
    openWithHeroContext({
      type: 'hero',
      context: data.context,
      message: data.message,
      company: data.metadata?.company as string | undefined,
      title: data.metadata?.title as string | undefined,
    })
  }, [openWithHeroContext, data])

  const handleDismiss = () => {
    // Salvar no localStorage para não mostrar novamente por um tempo
    const dismissKey = `hero_dismissed_${data.context}`
    localStorage.setItem(dismissKey, Date.now().toString())
    onDismiss?.()
  }

  const isChatCta = (href: string) => href.includes('chat=open')

  const renderCta = (cta: { label: string; href: string }) => {
    if (isChatCta(cta.href)) {
      return (
        <CopilotButton size="sm" onClick={handleOpenCopilot} className="w-full sm:w-auto">
          {cta.label}
        </CopilotButton>
      )
    }
    return (
      <Link href={cta.href} className="block w-full sm:w-auto">
        <Button size="sm" variant="secondary" className="w-full sm:w-auto">
          {cta.label}
        </Button>
      </Link>
    )
  }

  return (
    <Card variant="elevated" className="relative p-4 sm:p-6 bg-gradient-to-r from-teal/5 to-amber/5 border-teal/20">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 p-3 min-w-[44px] min-h-[44px] text-navy/40 hover:text-navy/60 transition-colors flex items-center justify-center"
        aria-label="Ignorar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pr-6">
        <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-teal" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-navy">{data.title}</h2>
      </div>

      {/* Message */}
      <p className="text-navy/80 mb-4 sm:mb-5 pr-4 sm:pr-8 leading-relaxed text-sm sm:text-base">
        {data.message}
      </p>

      {/* CTAs - todos os CTAs (Copilot com estilo gradiente, outros com secondary) */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
        <div className="w-full sm:w-auto">{renderCta(data.primaryCta)}</div>
        {data.secondaryCta && (
          <div className="w-full sm:w-auto">{renderCta(data.secondaryCta)}</div>
        )}
      </div>
    </Card>
  )
}
