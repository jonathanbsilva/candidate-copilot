'use client'

import { Sparkles } from 'lucide-react'
import { SuggestedQuestions } from './suggested-questions'

interface WelcomeStateProps {
  onSelectQuestion: (question: string) => void
  hasInterviewHistory?: boolean
}

export function WelcomeState({ onSelectQuestion, hasInterviewHistory = false }: WelcomeStateProps) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-navy mb-2">
          Ola! Sou seu Copilot
        </h3>
        <p className="text-sm text-navy/70 max-w-[280px] mx-auto">
          Posso te ajudar a entender sua busca de emprego e tomar decisoes melhores baseadas nos seus dados.
        </p>
      </div>
      
      {/* Perguntas sugeridas */}
      <div>
        <p className="text-xs text-navy/50 uppercase tracking-wide mb-3">
          Perguntas sugeridas
        </p>
        <SuggestedQuestions 
          onSelect={onSelectQuestion} 
          hasInterviewHistory={hasInterviewHistory}
        />
      </div>
    </div>
  )
}
