'use client'

import { useState } from 'react'
import { DashboardAskBox } from './dashboard-ask-box'
import { HeroCard } from './hero-card'
import type { HeroData } from '@/lib/hero'

interface CopilotAskSectionProps {
  heroData: HeroData | null
}

export function CopilotAskSection({ heroData }: CopilotAskSectionProps) {
  const [isHeroDismissed, setIsHeroDismissed] = useState(false)

  const handleHeroDismiss = () => {
    setIsHeroDismissed(true)
  }

  // Determine context for AskBox
  // - Hero open: use hero context (contextual questions)
  // - Hero dismissed or no hero: use generic questions
  const showHeroContext = heroData && !isHeroDismissed

  return (
    <div className="space-y-4">
      {/* AskBox - always visible, above HeroCard */}
      <DashboardAskBox
        heroContext={showHeroContext ? heroData.context : undefined}
        metadata={showHeroContext ? {
          company: heroData.metadata?.company as string,
          title: heroData.metadata?.title as string,
        } : undefined}
        message={showHeroContext ? heroData.message : undefined}
      />

      {/* HeroCard - only when not dismissed */}
      {heroData && !isHeroDismissed && (
        <HeroCard data={heroData} onDismiss={handleHeroDismiss} />
      )}
    </div>
  )
}
