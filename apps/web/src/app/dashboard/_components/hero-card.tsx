'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Card, Button } from '@ui/components'
import { X, Sparkles } from 'lucide-react'
import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'
import type { HeroData } from '@/lib/hero'

interface HeroCardProps {
  data: HeroData
}

export function HeroCard({ data }: HeroCardProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const { openWithHeroContext } = useCopilotDrawer()

  const handleOpenChat = useCallback(() => {
    openWithHeroContext({
      type: 'hero',
      context: data.context,
      message: data.message,
      company: data.metadata?.company as string | undefined,
      title: data.metadata?.title as string | undefined,
    })
  }, [openWithHeroContext, data])

  if (isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Opcional: salvar no localStorage para não mostrar novamente por um tempo
    const dismissKey = `hero_dismissed_${data.context}`
    localStorage.setItem(dismissKey, Date.now().toString())
  }

  // Check if the CTA should open the copilot chat
  const isChatCta = (href: string) => href.includes('chat=open')

  const renderCta = (cta: { label: string; href: string }, isPrimary: boolean) => {
    if (isChatCta(cta.href)) {
      return (
        <CopilotButton size="sm" onClick={handleOpenChat}>
          {cta.label}
        </CopilotButton>
      )
    }
    
    return (
      <Link href={cta.href}>
        <Button size="sm" variant="secondary">
          {cta.label}
        </Button>
      </Link>
    )
  }

  return (
    <Card variant="elevated" className="relative p-6 bg-gradient-to-r from-teal/5 to-amber/5 border-teal/20">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 text-navy/40 hover:text-navy/60 transition-colors"
        aria-label="Ignorar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-teal" />
        </div>
        <h2 className="text-lg font-semibold text-navy">{data.title}</h2>
      </div>

      {/* Message */}
      <p className="text-navy/80 mb-5 pr-8 leading-relaxed">
        {data.message}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        {renderCta(data.primaryCta, true)}
        {data.secondaryCta && renderCta(data.secondaryCta, false)}
      </div>
    </Card>
  )
}
