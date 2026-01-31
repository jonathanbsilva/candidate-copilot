'use client'

import { Card, Button } from '@ui/components'
import { Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  remaining: number
  limit: number
  feature?: 'insights' | 'interview_pro' | 'career_coach' | 'applications' | 'copilot'
}

export function UpgradePrompt({ remaining, limit, feature = 'insights' }: UpgradePromptProps) {
  const used = limit - remaining
  
  const messages = {
    insights: {
      title: 'Você atingiu o limite de insights',
      subtitle: `${used} de ${limit} insights usados este mês`
    },
    applications: {
      title: 'Você atingiu o limite de vagas',
      subtitle: `${used} de ${limit} vagas usadas`
    },
    copilot: {
      title: 'Você atingiu o limite diário do Copilot',
      subtitle: `${used} de ${limit} perguntas usadas hoje`
    },
    interview_pro: {
      title: 'Interview Pro é exclusivo do plano Pro',
      subtitle: 'Faça upgrade para treinar entrevistas com IA'
    },
    career_coach: {
      title: 'Career Coach é exclusivo do plano Pro',
      subtitle: 'Faça upgrade para ter um coach de carreira pessoal'
    }
  }

  const { title, subtitle } = messages[feature] || messages.insights

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-6 h-6 text-amber" />
      </div>
      <h2 className="text-xl font-semibold text-navy mb-2">{title}</h2>
      <p className="text-navy/70 mb-6">{subtitle}</p>

      <div className="bg-sand rounded-lg p-4 mb-6 text-left">
        <p className="font-medium text-navy mb-3">Com o Pro você tem:</p>
        <ul className="space-y-2 text-sm text-navy/80">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal" /> Insights ilimitados
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal" /> Vagas ilimitadas
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal" /> Copilot ilimitado
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal" /> Interview Pro (mock interviews)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal" /> Career Coach IA
          </li>
        </ul>
      </div>

      <Link href="/dashboard/plano">
        <Button size="lg" className="w-full">
          Fazer upgrade - R$ 19/mês
        </Button>
      </Link>
    </Card>
  )
}
