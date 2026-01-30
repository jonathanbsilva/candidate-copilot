'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { X, Sparkles, Send, RotateCcw, Crown } from 'lucide-react'
import { Button, Badge } from '@ui/components'
import { ChatMessages } from './chat-messages'
import { WelcomeState } from './welcome-state'
import { SuggestedQuestions } from './suggested-questions'
import { sendChatMessage, checkCopilotAccess, checkInterviewHistory, type CopilotAccessInfo } from './actions'
import type { ChatMessage } from '@/lib/copilot/types'
import Link from 'next/link'
import { useCopilotDrawer, type InsightContext, type HeroContext, type InterviewContext } from '@/hooks/use-copilot-drawer'
import { insightInitialMessages, heroInitialMessages, getInterviewInitialMessage } from './insight-messages'

interface CopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  insightContext?: InsightContext | null
}

export function CopilotDrawer({ isOpen, onClose, insightContext: propContext }: CopilotDrawerProps) {
  const { insightContext: storeContext, heroContext: storeHeroContext, interviewContext: storeInterviewContext, clearContext } = useCopilotDrawer()
  const insightContext = propContext || storeContext
  const heroContext = storeHeroContext
  const interviewContext = storeInterviewContext
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [accessInfo, setAccessInfo] = useState<CopilotAccessInfo | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false)
  const [hasInterviewHistory, setHasInterviewHistory] = useState(false)

  // Track previous context to detect changes
  const prevInsightContextId = useRef<string | null>(null)
  const prevHeroContextKey = useRef<string | null>(null)
  const prevInterviewContextId = useRef<string | null>(null)

  // Reset chat when context changes
  useEffect(() => {
    const currentInsightId = insightContext?.id || null
    const currentHeroKey = heroContext ? `${heroContext.context}-${heroContext.company}-${heroContext.title}` : null
    const currentInterviewId = interviewContext?.sessionId || null

    const contextChanged = 
      (currentInsightId && currentInsightId !== prevInsightContextId.current) ||
      (currentHeroKey && currentHeroKey !== prevHeroContextKey.current) ||
      (currentInterviewId && currentInterviewId !== prevInterviewContextId.current)

    if (contextChanged && isOpen) {
      // Reset chat for new context
      setMessages([])
      setInput('')
      setHasShownInitialMessage(false)
    }

    // Update refs
    prevInsightContextId.current = currentInsightId
    prevHeroContextKey.current = currentHeroKey
    prevInterviewContextId.current = currentInterviewId
  }, [insightContext, heroContext, interviewContext, isOpen])

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Travar scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Check copilot access and interview history when drawer opens
  useEffect(() => {
    if (isOpen) {
      checkCopilotAccess().then((info) => {
        if (info) {
          setAccessInfo(info)
          setLimitReached(!info.allowed)
        }
      })
      // Check interview history for all users (Free users can have trial history)
      checkInterviewHistory().then(setHasInterviewHistory)
    }
  }, [isOpen])

  // Show initial message when opening with insight, hero, or interview context
  useEffect(() => {
    if (isOpen && !hasShownInitialMessage && messages.length === 0) {
      let initialMessage: string | null = null
      
      if (interviewContext) {
        initialMessage = getInterviewInitialMessage(interviewContext.cargo, interviewContext.score)
      } else if (insightContext) {
        initialMessage = insightInitialMessages[insightContext.tipo] || insightInitialMessages.default
      } else if (heroContext) {
        const heroMsg = heroInitialMessages[heroContext.context]
        if (typeof heroMsg === 'function') {
          initialMessage = heroMsg(heroContext.company, heroContext.title)
        } else {
          initialMessage = heroMsg || heroInitialMessages.active_summary as string
        }
      }
      
      if (initialMessage) {
        const assistantMessage: ChatMessage = {
          id: `assistant-initial-${Date.now()}`,
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        }
        
        setMessages([assistantMessage])
        setHasShownInitialMessage(true)
      }
    }
  }, [isOpen, insightContext, heroContext, interviewContext, hasShownInitialMessage, messages.length])

  const handleSubmit = useCallback(async (question: string) => {
    if (!question.trim() || isLoading || limitReached) return
    
    // Adicionar mensagem do usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Convert InsightContext to InsightContextData for the server action
      const contextData = insightContext ? {
        id: insightContext.id,
        tipo: insightContext.tipo,
        cargo: insightContext.cargo,
        area: insightContext.area,
        recommendation: insightContext.recommendation,
        next_steps: insightContext.next_steps,
      } : null
      
      // Convert HeroContext to HeroContextData for the server action
      const heroContextData = heroContext ? {
        context: heroContext.context,
        message: heroContext.message,
        company: heroContext.company,
        title: heroContext.title,
      } : null
      
      // Convert InterviewContext to InterviewContextData for the server action
      const interviewContextData = interviewContext ? {
        sessionId: interviewContext.sessionId,
        cargo: interviewContext.cargo,
        area: interviewContext.area,
        score: interviewContext.score,
        summary: interviewContext.summary,
        strengths: interviewContext.strengths,
        improvements: interviewContext.improvements,
        tips: interviewContext.tips,
      } : null
      
      const response = await sendChatMessage(question, messages, contextData, heroContextData, interviewContextData)
      
      // Check if limit was reached
      if (response.limitReached) {
        setLimitReached(true)
      }
      
      // Adicionar resposta do assistente
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Update access info after message
      if (accessInfo && accessInfo.plan === 'free') {
        const newUsed = accessInfo.used + 1
        setAccessInfo({
          ...accessInfo,
          used: newUsed,
          allowed: newUsed < accessInfo.limit
        })
        if (newUsed >= accessInfo.limit) {
          setLimitReached(true)
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, limitReached, accessInfo, insightContext, heroContext, interviewContext])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  const handleQuestionSelect = (question: string) => {
    handleSubmit(question)
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
    setHasShownInitialMessage(false)
    clearContext()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`
          fixed right-0 top-0 h-screen w-full sm:w-96 bg-white 
          border-l border-stone/30 z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Copilot Chat"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-navy">Copilot</span>
            {accessInfo && accessInfo.plan === 'free' && (
              <Badge className="text-[10px] bg-stone/20 text-navy/60">
                {accessInfo.limit - accessInfo.used}/{accessInfo.limit}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="h-8 w-8 p-0"
                title="Nova conversa"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <WelcomeState 
              onSelectQuestion={handleQuestionSelect}
              hasInterviewHistory={hasInterviewHistory}
            />
          ) : (
            <>
              <ChatMessages messages={messages} isLoading={isLoading} />
              
              {/* Perguntas sugeridas apos conversa */}
              {!isLoading && messages.length > 0 && (
                <div className="mt-6 pt-4 border-t border-stone/20">
                  <p className="text-xs text-navy/50 mb-3">Perguntar mais:</p>
                  <SuggestedQuestions 
                    onSelect={handleQuestionSelect} 
                    compact
                    insightContext={insightContext}
                    heroContext={heroContext}
                    interviewContext={interviewContext}
                    hasInterviewHistory={hasInterviewHistory}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stone/30 bg-white">
          {limitReached && accessInfo?.plan === 'free' ? (
            <div className="text-center">
              <p className="text-sm text-navy/70 mb-3">
                Voce usou suas {accessInfo.limit} perguntas de hoje.
              </p>
              <Link href="/dashboard/plano" onClick={onClose}>
                <Button size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade para ilimitado
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo..."
                disabled={isLoading}
                className="
                  flex-1 h-11 px-4 rounded-lg border border-stone
                  text-navy placeholder:text-navy/40
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="
                  h-11 w-11 rounded-lg flex items-center justify-center
                  bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500
                  hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
