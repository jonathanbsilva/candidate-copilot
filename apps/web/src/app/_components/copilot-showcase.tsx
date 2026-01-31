'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Button } from '@ui/components'
import { Sparkles, User, ArrowRight, MessageSquare, TrendingUp, Target, Mail, Briefcase } from 'lucide-react'
import Link from 'next/link'

// Tipos
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationContext {
  id: string
  label: string
  icon: React.ReactNode
  messages: Message[]
}

// Conversas de exemplo para cada contexto
const CONVERSATIONS: ConversationContext[] = [
  {
    id: 'proposta',
    label: 'Proposta',
    icon: <Briefcase className="w-4 h-4" />,
    messages: [
      {
        role: 'user',
        content: 'Recebi uma proposta da XYZ, mas o salário é 15% menor que o atual.'
      },
      {
        role: 'assistant',
        content: 'Entendi! Além do salário, considere: benefícios, equity, crescimento na carreira...\n\nSua taxa de conversão está em 23% - acima da média. Você tem poder de negociação. Quer que eu ajude a montar uma contraproposta?'
      }
    ]
  },
  {
    id: 'entrevista',
    label: 'Entrevista',
    icon: <MessageSquare className="w-4 h-4" />,
    messages: [
      {
        role: 'user',
        content: 'Tenho uma entrevista na semana que vem, como me preparo?'
      },
      {
        role: 'assistant',
        content: 'Vi que você aplicou para PM na TechCorp. Baseado no histórico deles:\n\n1. Prepare cases de produto\n2. Estude métricas de sucesso\n3. Pratique na Entrevista IA\n\nQuer simular uma entrevista agora?'
      }
    ]
  },
  {
    id: 'metricas',
    label: 'Métricas',
    icon: <TrendingUp className="w-4 h-4" />,
    messages: [
      {
        role: 'user',
        content: 'Qual minha taxa de conversão?'
      },
      {
        role: 'assistant',
        content: 'Suas métricas deste mês:\n\n• 12 aplicações\n• Taxa de conversão: 25% (vs 18% média)\n• 3 processos ativos\n\nVocê está 38% acima da média! Continue assim.'
      }
    ]
  },
  {
    id: 'carreira',
    label: 'Carreira',
    icon: <Target className="w-4 h-4" />,
    messages: [
      {
        role: 'user',
        content: 'Devo aceitar a proposta ou continuar buscando?'
      },
      {
        role: 'assistant',
        content: 'Baseado no seu perfil Senior PM e objetivo "crescimento":\n\n• Proposta atual: movimento lateral\n• Mercado: aquecido para seu perfil\n\nRecomendo negociar ou continuar buscando. Posso ajudar com a estratégia?'
      }
    ]
  },
  {
    id: 'followup',
    label: 'Follow-up',
    icon: <Mail className="w-4 h-4" />,
    messages: [
      {
        role: 'user',
        content: 'Quais empresas preciso fazer follow-up?'
      },
      {
        role: 'assistant',
        content: '2 aplicações precisam de atenção:\n\n• TechCorp (12 dias sem resposta)\n• StartupABC (8 dias sem resposta)\n\nQuer que eu escreva os emails de follow-up?'
      }
    ]
  }
]

// Typewriter Hook
function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    let currentIndex = 0
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, enabled])

  return { displayedText, isComplete }
}

// Componente principal
export function CopilotShowcase() {
  const [activeContext, setActiveContext] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [animatingMessages, setAnimatingMessages] = useState<Message[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const lastInteractionRef = useRef<number>(Date.now())
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null)

  const currentConversation = CONVERSATIONS[activeContext]
  
  // Reset mensagens quando muda o contexto
  useEffect(() => {
    setCurrentMessageIndex(0)
    setAnimatingMessages([])
  }, [activeContext])

  // Adicionar mensagens progressivamente
  useEffect(() => {
    if (currentMessageIndex < currentConversation.messages.length) {
      const delay = currentMessageIndex === 0 ? 300 : 800
      const timer = setTimeout(() => {
        setAnimatingMessages(prev => [...prev, currentConversation.messages[currentMessageIndex]])
        setCurrentMessageIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [currentMessageIndex, currentConversation.messages])

  // Auto-rotation entre contextos
  const startAutoRotation = useCallback(() => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current)
    }
    
    autoRotateRef.current = setInterval(() => {
      if (!isPaused && Date.now() - lastInteractionRef.current > 30000) {
        setActiveContext(prev => (prev + 1) % CONVERSATIONS.length)
      } else if (!isPaused) {
        setActiveContext(prev => (prev + 1) % CONVERSATIONS.length)
      }
    }, 10000) // Rotaciona a cada 10 segundos
  }, [isPaused])

  useEffect(() => {
    startAutoRotation()
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current)
      }
    }
  }, [startAutoRotation])

  // Pausar auto-rotation quando o usuário interage
  const handleContextChange = (index: number) => {
    setActiveContext(index)
    setIsPaused(true)
    lastInteractionRef.current = Date.now()
    
    // Resume após 30 segundos de inatividade
    setTimeout(() => {
      setIsPaused(false)
    }, 30000)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-sand/50">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-3">
            Seu copiloto de carreira pessoal
          </h2>
          <p className="text-navy/70 max-w-2xl mx-auto">
            Converse com a IA que entende seu contexto e te ajuda a tomar melhores decisões de carreira.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
          {/* Context Tabs - Mobile: horizontal scroll, Desktop: vertical sidebar */}
          <div className="lg:w-48 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {CONVERSATIONS.map((conv, index) => (
                <button
                  key={conv.id}
                  onClick={() => handleContextChange(index)}
                  className={`
                    flex items-center gap-2 px-4 py-3.5 min-h-[44px] rounded-lg text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${activeContext === index 
                      ? 'bg-navy text-sand shadow-md' 
                      : 'bg-white text-navy/70 hover:bg-stone/20 hover:text-navy'
                    }
                  `}
                >
                  {conv.icon}
                  {conv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Mockup */}
          <Card className="flex-1 p-0 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone/20 bg-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-navy">GoHire Copilot</h3>
                <p className="text-xs text-navy/50">Sempre disponível para ajudar</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 sm:p-5 space-y-4 min-h-[220px] sm:min-h-[280px] bg-sand/30">
              {animatingMessages.map((message, index) => (
                <AnimatedMessage 
                  key={`${activeContext}-${index}`}
                  message={message}
                  isLast={index === animatingMessages.length - 1}
                />
              ))}
              
              {/* Typing indicator quando próxima mensagem está vindo */}
              {currentMessageIndex < currentConversation.messages.length && animatingMessages.length > 0 && (
                <TypingIndicator />
              )}
            </div>

            {/* CTA dentro do chat */}
            <div className="px-5 py-4 border-t border-stone/20 bg-white flex justify-center">
              <Link href="/dashboard">
                <button className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg text-white font-medium bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 transition-all shadow-md hover:shadow-lg">
                  Experimente o Copilot
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

// Componente de mensagem animada
function AnimatedMessage({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user'
  const { displayedText, isComplete } = useTypewriter(
    message.content, 
    isUser ? 20 : 25,
    isLast
  )

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-navy' 
          : 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-sand" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Message */}
      <div className={`
        max-w-[85%] rounded-xl px-4 py-3
        ${isUser 
          ? 'bg-navy text-sand' 
          : 'bg-white text-navy shadow-sm'
        }
      `}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {displayedText}
          {!isComplete && isLast && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  )
}

// Indicador de digitação
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
