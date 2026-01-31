'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, RadioGroup } from '@ui/components'
import { Send, Loader2, Sparkles, User } from 'lucide-react'
import { createApplication } from '../actions'
import type { ApplicationDraft, ChatStep } from './types'
import { statusConfig, type ApplicationStatus } from '@/lib/types/application'
import { track } from '@/lib/analytics/track'

type StepType = 'text' | 'select' | 'optional-text'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const steps: { id: ChatStep; question: string; type: StepType }[] = [
  { id: 'company', question: 'Olá! Vamos registrar sua nova aplicação. Qual empresa você está aplicando?', type: 'text' },
  { id: 'title', question: 'Ótimo! E qual é o cargo ou vaga?', type: 'text' },
  { id: 'status', question: 'Perfeito! Qual o status atual dessa aplicação?', type: 'select' },
  { id: 'url', question: 'Quase lá! Tem o link da vaga? (pode pular se não tiver)', type: 'optional-text' },
]

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}))

export function ChatFlow() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: steps[0].question }
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState<Partial<ApplicationDraft>>({})
  const [currentValue, setCurrentValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const step = steps[currentStep]
  const isComplete = currentStep >= steps.length

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!isTyping && !isComplete) {
      inputRef.current?.focus()
    }
  }, [currentStep, isTyping, isComplete])

  const addBotMessage = (content: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content,
      }])
      setIsTyping(false)
    }, 600)
  }

  const handleSend = () => {
    if (!currentValue && step.type !== 'optional-text') return

    const userMessage = currentValue || '(pulado)'
    const displayValue = step.type === 'select' 
      ? statusConfig[currentValue as ApplicationStatus]?.label || currentValue
      : userMessage

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: displayValue,
    }])

    // Save to draft
    if (currentValue) {
      setDraft(prev => ({ ...prev, [step.id]: currentValue }))
    }

    setCurrentValue('')
    const nextStep = currentStep + 1

    if (nextStep < steps.length) {
      setCurrentStep(nextStep)
      addBotMessage(steps[nextStep].question)
    } else {
      setCurrentStep(nextStep)
      addBotMessage('Perfeito! Tudo pronto para salvar sua aplicacao. Clique no botao abaixo para confirmar.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createApplication({
        company: draft.company || '',
        title: draft.title || '',
        url: draft.url || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        track('application_created', {
          company: draft.company || '',
          status: draft.status || 'aplicado',
          source: 'chat_flow',
        })
        router.push('/dashboard/aplicacoes')
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInput = () => {
    if (isComplete) {
      return (
        <div className="p-4 border-t border-stone/30 bg-white">
          {error && (
            <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar aplicacao'
            )}
          </Button>
        </div>
      )
    }

    if (isTyping) {
      return (
        <div className="p-4 border-t border-stone/30 bg-white">
          <div className="h-11 flex items-center text-navy/40 text-sm">
            Aguarde...
          </div>
        </div>
      )
    }

    if (step.type === 'select') {
      return (
        <div className="p-4 border-t border-stone/30 bg-white space-y-3">
          <RadioGroup
            name="status"
            options={statusOptions}
            value={currentValue}
            onChange={setCurrentValue}
            orientation="horizontal"
          />
          <Button onClick={handleSend} disabled={!currentValue} className="w-full">
            Enviar
            <Send className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )
    }

    return (
      <div className="p-4 border-t border-stone/30 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.type === 'optional-text' ? 'https://... ou deixe vazio para pular' : 'Digite sua resposta...'}
            className="
              flex-1 h-11 px-4 rounded-lg border border-stone
              text-navy placeholder:text-navy/40
              focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
            "
          />
          <Button 
            onClick={handleSend} 
            disabled={step.type !== 'optional-text' && !currentValue}
            className="h-11 w-11 p-0"
          >
            {step.type === 'optional-text' && !currentValue ? 'Pular' : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] -m-6">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${message.role === 'user' ? 'bg-navy' : 'bg-amber'}
              `}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-sand" />
                ) : (
                  <Sparkles className="w-4 h-4 text-navy" />
                )}
              </div>

              {/* Message */}
              <div className={`
                max-w-[85%] rounded-xl px-4 py-3
                ${message.role === 'user' 
                  ? 'bg-navy text-sand' 
                  : 'bg-stone/10 text-navy'
                }
              `}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-navy" />
              </div>
              <div className="bg-stone/10 rounded-xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      {renderInput()}
    </div>
  )
}
