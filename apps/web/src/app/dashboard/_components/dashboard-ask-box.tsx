'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Card } from '@ui/components'
import { useCopilotDrawer, type HeroContext } from '@/hooks/use-copilot-drawer'
import { heroSuggestedQuestions } from './copilot-chat/insight-messages'

// Perguntas genéricas para quando não há contexto do Hero
const genericQuestions = [
  'O que deveria ser minha prioridade agora?',
  'Estou no caminho certo pro meu objetivo?',
  'Me ajuda a preparar para entrevistas',
  'Onde você acha que estou travando?',
]

interface DashboardAskBoxProps {
  heroContext?: string  // opcional - quando undefined, usa perguntas genéricas
  metadata?: { company?: string; title?: string }
  message?: string
}

type TypingPhase = 'typing' | 'waiting' | 'deleting'

export function DashboardAskBox({ 
  heroContext, 
  metadata, 
  message,
}: DashboardAskBoxProps) {
  const { openWithPendingQuestion } = useCopilotDrawer()
  
  // Com heroContext: perguntas contextuais; sem heroContext: perguntas genéricas
  const questions = heroContext 
    ? (heroSuggestedQuestions[heroContext] || heroSuggestedQuestions.active_summary)
    : genericQuestions
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [phase, setPhase] = useState<TypingPhase>('typing')
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[currentIndex]

  // Typing effect
  useEffect(() => {
    if (phase === 'typing') {
      if (displayedText.length < currentQuestion.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentQuestion.slice(0, displayedText.length + 1))
        }, 40) // typing speed
        return () => clearTimeout(timeout)
      } else {
        // Finished typing, wait 3 seconds
        setPhase('waiting')
      }
    }
  }, [phase, displayedText, currentQuestion])

  // Waiting phase - 5 seconds then start deleting
  useEffect(() => {
    if (phase === 'waiting') {
      const timeout = setTimeout(() => {
        setPhase('deleting')
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [phase])

  // Deleting effect
  useEffect(() => {
    if (phase === 'deleting') {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, 25) // deleting speed (faster than typing)
        return () => clearTimeout(timeout)
      } else {
        // Finished deleting, move to next question
        setCurrentIndex((i) => (i + 1) % questions.length)
        setPhase('typing')
      }
    }
  }, [phase, displayedText, questions.length])

  // Build HeroContext to pass to the drawer (only when hero context is available)
  const buildContext = useCallback((): HeroContext | undefined => {
    if (!heroContext) return undefined // Generic questions don't need hero context
    return {
      type: 'hero',
      context: heroContext,
      message: message || '',
      company: metadata?.company,
      title: metadata?.title,
    }
  }, [heroContext, message, metadata])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    openWithPendingQuestion(input.trim(), buildContext())
    setInput('')
  }

  const handleBadgeClick = () => {
    openWithPendingQuestion(currentQuestion, buildContext())
  }

  // Single badge with typing effect (below input)
  const badgeComponent = (
    <div className="mt-3 min-h-[32px]">
      <button
        onClick={handleBadgeClick}
        className="
          px-3 py-1.5 rounded-full 
          bg-stone/10 hover:bg-stone/20 
          text-xs text-navy/70 hover:text-navy 
          transition-colors inline-flex items-center
        "
      >
        <span>{displayedText}</span>
        <span className="animate-pulse ml-0.5">|</span>
      </button>
    </div>
  )

  const inputComponent = (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pergunte ao Copilot..."
        className="
          flex-1 h-11 min-h-[44px] px-4 rounded-lg border border-stone
          text-navy placeholder:text-navy/40
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          bg-white
        "
        aria-label="Pergunte ao Copilot"
      />
      <button 
        type="submit" 
        disabled={!input.trim()}
        aria-label="Enviar pergunta"
        className="
          h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center
          bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500
          hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        <Send className="w-4 h-4 text-white" aria-hidden="true" />
      </button>
    </form>
  )

  // AI-first visual with gradient background
  return (
    <Card 
      variant="elevated" 
      className="p-4 sm:p-5 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 border-purple-200/50"
    >
      {inputComponent}
      {badgeComponent}
    </Card>
  )
}
