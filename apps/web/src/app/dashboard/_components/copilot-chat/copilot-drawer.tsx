'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { X, Sparkles, Send, RotateCcw, Crown, Plus } from 'lucide-react'
import { Button, Badge } from '@ui/components'
import { ChatMessages } from './chat-messages'
import { WelcomeState } from './welcome-state'
import { SuggestedQuestions } from './suggested-questions'
import { sendChatMessage, checkCopilotAccess, checkInterviewHistory, hasActiveProposal, type CopilotAccessInfo } from './actions'
import type { ChatMessage } from '@/lib/copilot/types'
import Link from 'next/link'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'
import { insightInitialMessages, heroInitialMessages, getInterviewInitialMessage, getBenchmarkInitialMessage, getApplicationInitialMessage } from './insight-messages'

export function CopilotDrawer() {
  // Single source of truth: Zustand store
  const { 
    isOpen, 
    close: onClose, 
    insightContext, 
    heroContext, 
    interviewContext,
    benchmarkContext,
    applicationContext,
    pendingQuestion,
    clearPendingQuestion,
    clearContext 
  } = useCopilotDrawer()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [accessInfo, setAccessInfo] = useState<CopilotAccessInfo | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false)
  const [hasInterviewHistory, setHasInterviewHistory] = useState(false)
  const [hasProposal, setHasProposal] = useState<boolean | null>(null) // null = loading, true/false = loaded

  // Track previous context to detect changes
  const prevInsightContextId = useRef<string | null>(null)
  const prevHeroContextKey = useRef<string | null>(null)
  const prevInterviewContextId = useRef<string | null>(null)
  const prevBenchmarkContextKey = useRef<string | null>(null)
  const prevApplicationContextId = useRef<string | null>(null)

  // Reset chat when context changes
  useEffect(() => {
    const currentInsightId = insightContext?.id || null
    const currentHeroKey = heroContext ? `${heroContext.context}-${heroContext.company}-${heroContext.title}` : null
    const currentInterviewId = interviewContext?.sessionId || null
    const currentBenchmarkKey = benchmarkContext ? `benchmark-${benchmarkContext.userTaxa}-${benchmarkContext.mediaTaxa}` : null
    const currentApplicationId = applicationContext?.id || null

    const contextChanged = 
      (currentInsightId && currentInsightId !== prevInsightContextId.current) ||
      (currentHeroKey && currentHeroKey !== prevHeroContextKey.current) ||
      (currentInterviewId && currentInterviewId !== prevInterviewContextId.current) ||
      (currentBenchmarkKey && currentBenchmarkKey !== prevBenchmarkContextKey.current) ||
      (currentApplicationId && currentApplicationId !== prevApplicationContextId.current)

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
    prevBenchmarkContextKey.current = currentBenchmarkKey
    prevApplicationContextId.current = currentApplicationId
  }, [insightContext, heroContext, interviewContext, benchmarkContext, applicationContext, isOpen])

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

  // Check copilot access, interview history, and proposals when drawer opens
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
      // Check if user has any active proposal
      hasActiveProposal().then(setHasProposal)
    }
  }, [isOpen])

  // Show initial message when opening with specific context (insight, hero, interview, benchmark, application)
  useEffect(() => {
    if (isOpen && !hasShownInitialMessage && messages.length === 0) {
      let initialMessage: string | null = null
      
      if (applicationContext) {
        initialMessage = getApplicationInitialMessage(applicationContext)
      } else if (benchmarkContext) {
        initialMessage = getBenchmarkInitialMessage(
          benchmarkContext.userTaxa, 
          benchmarkContext.mediaTaxa, 
          benchmarkContext.isAbove, 
          benchmarkContext.percentil
        )
      } else if (interviewContext) {
        initialMessage = getInterviewInitialMessage(interviewContext.cargo, interviewContext.score)
      } else if (insightContext) {
        initialMessage = insightInitialMessages[insightContext.tipo] || insightInitialMessages.default
      } else if (heroContext) {
        // Se heroContext.message foi fornecido diretamente, usar ele
        // Caso contrário, buscar na lista de mensagens predefinidas
        if (heroContext.message && !heroInitialMessages[heroContext.context]) {
          initialMessage = heroContext.message
        } else {
          const heroMsg = heroInitialMessages[heroContext.context]
          if (typeof heroMsg === 'function') {
            initialMessage = heroMsg(heroContext.company, heroContext.title)
          } else {
            initialMessage = heroMsg || heroContext.message || heroInitialMessages.active_summary as string
          }
        }
      }
      // Sem contexto específico: mostrar WelcomeState com perguntas sugeridas
      
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
  }, [isOpen, insightContext, heroContext, interviewContext, benchmarkContext, applicationContext, hasShownInitialMessage, messages.length])

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
      // Convert InsightContext to InsightContextData for the server action (V1.1 enhanced)
      const contextData = insightContext ? {
        id: insightContext.id,
        tipo: insightContext.tipo,
        cargo: insightContext.cargo,
        area: insightContext.area,
        senioridade: insightContext.senioridade,
        status: insightContext.status,
        objetivo: insightContext.objetivo,
        // V1 fields
        recommendation: insightContext.recommendation,
        next_steps: insightContext.next_steps,
        // V1.1 diagnostic fields
        diagnosis: insightContext.diagnosis,
        pattern: insightContext.pattern,
        risk: insightContext.risk,
        nextStep: insightContext.nextStep,
        typeLabel: insightContext.typeLabel,
        // V1.1 contextual data
        urgencia: insightContext.urgencia,
        tempoSituacao: insightContext.tempoSituacao,
        decisionBlocker: insightContext.decisionBlocker,
        interviewBottleneck: insightContext.interviewBottleneck,
        maxStage: insightContext.maxStage,
        leverageSignals: insightContext.leverageSignals,
        pivotType: insightContext.pivotType,
        transferableStrengths: insightContext.transferableStrengths,
        avoidedDecision: insightContext.avoidedDecision,
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
      
      // Convert BenchmarkContext to BenchmarkContextData for the server action
      const benchmarkContextData = benchmarkContext ? {
        userTaxa: benchmarkContext.userTaxa,
        mediaTaxa: benchmarkContext.mediaTaxa,
        percentil: benchmarkContext.percentil,
        totalUsuarios: benchmarkContext.totalUsuarios,
        diff: benchmarkContext.diff,
        isAbove: benchmarkContext.isAbove,
      } : null
      
      // Convert ApplicationContext to ApplicationContextData for the server action
      const applicationContextData = applicationContext ? {
        id: applicationContext.id,
        company: applicationContext.company,
        title: applicationContext.title,
        status: applicationContext.status,
        salaryRange: applicationContext.salaryRange,
        notes: applicationContext.notes,
        jobDescription: applicationContext.jobDescription,
        location: applicationContext.location,
        url: applicationContext.url,
      } : null
      
      const response = await sendChatMessage(question, messages, contextData, heroContextData, interviewContextData, benchmarkContextData, applicationContextData)
      
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
        cta: response.cta ?? undefined,
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
  }, [isLoading, messages, limitReached, accessInfo, insightContext, heroContext, interviewContext, benchmarkContext, applicationContext])

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

  // Process pending question from AskBox
  useEffect(() => {
    if (!isOpen || !pendingQuestion) return
    const q = pendingQuestion
    clearPendingQuestion()
    // Small delay to ensure the drawer has rendered
    setTimeout(() => handleSubmit(q), 50)
  }, [isOpen, pendingQuestion, clearPendingQuestion, handleSubmit])

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
          fixed inset-y-0 right-0 w-full sm:w-96 bg-white 
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
                className="min-h-[44px] min-w-[44px] p-2.5"
                aria-label="Nova conversa"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2.5"
              aria-label="Fechar Copilot"
            >
              <X className="w-5 h-5" aria-hidden="true" />
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
              
              {/* Perguntas sugeridas após conversa */}
              {!isLoading && messages.length > 0 && (
                <div className="mt-6 pt-4 border-t border-stone/20">
                  <p className="text-xs text-navy/50 mb-3">Perguntar mais:</p>
                  <SuggestedQuestions 
                    onSelect={handleQuestionSelect} 
                    compact
                    insightContext={insightContext}
                    heroContext={heroContext}
                    interviewContext={interviewContext}
                    benchmarkContext={benchmarkContext}
                    hasInterviewHistory={hasInterviewHistory}
                  />
                  
                  {/* Card para adicionar proposta quando não tem nenhuma ativa */}
                  {hasProposal === false && (heroContext?.context?.includes('proposta') || heroContext?.context?.includes('avaliar')) && (
                    <Link 
                      href="/dashboard/aplicacoes/nova"
                      onClick={onClose}
                      className="mt-4 p-3 bg-amber/10 rounded-lg border border-amber/20 flex items-center gap-3 hover:bg-amber/15 transition-colors"
                      style={{
                        animation: 'fadeUp 0.4s ease-out forwards',
                      }}
                    >
                      <div className="w-8 h-8 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4 text-amber" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">Adicionar proposta</p>
                        <p className="text-xs text-navy/60">Registre para acompanhar</p>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-stone/30 bg-white">
          {limitReached && accessInfo?.plan === 'free' ? (
            <div className="text-center">
              <p className="text-sm text-navy/70 mb-3">
                Você usou suas {accessInfo.limit} perguntas de hoje.
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
                aria-label="Enviar mensagem"
                className="
                  h-11 w-11 rounded-lg flex items-center justify-center
                  bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500
                  hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                <Send className="w-4 h-4 text-white" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
