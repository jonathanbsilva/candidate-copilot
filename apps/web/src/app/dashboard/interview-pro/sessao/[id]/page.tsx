'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge, Progress } from '@ui/components'
import { Send, Loader2, X, MessageSquare } from 'lucide-react'
import { getSession, submitAnswer, abandonSession, type InterviewSession } from '../../actions'
import { track } from '@/lib/analytics/track'

export default function SessaoPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [session, setSession] = useState<InterviewSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const currentQuestion = session?.questions?.[session.answers?.length || 0]
  const questionNumber = (session?.answers?.length || 0) + 1
  const totalQuestions = 3

  useEffect(() => {
    async function loadSession() {
      const data = await getSession(sessionId)
      if (!data) {
        router.push('/dashboard/interview-pro')
        return
      }
      if (data.status === 'completed') {
        router.push(`/dashboard/interview-pro/resultado/${sessionId}`)
        return
      }
      setSession(data)
      setIsLoading(false)
    }
    loadSession()
  }, [sessionId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || answer.length < 50) {
      setError('Resposta muito curta. Escreva pelo menos 50 caracteres.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await submitAnswer(sessionId, answer.trim())

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.completed) {
        track('interview_completed', {
          cargo: session?.cargo,
          score: result.feedback?.overall_score,
        })
        router.push(`/dashboard/interview-pro/resultado/${sessionId}`)
        return
      }

      // Update session with next question
      if (result.nextQuestion && session) {
        setSession({
          ...session,
          questions: [...(session.questions || []), result.nextQuestion],
          answers: [...(session.answers || []), answer.trim()],
        })
        setAnswer('')
        setIsSubmitting(false)
        
        // Focus textarea for next answer
        setTimeout(() => textareaRef.current?.focus(), 100)
      }
    } catch (err) {
      setError('Erro ao enviar resposta. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  const handleAbandon = async () => {
    if (confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
      await abandonSession(sessionId)
      track('interview_abandoned', {
        cargo: session?.cargo,
        question_number: questionNumber,
      })
      router.push('/dashboard/interview-pro')
    }
  }

  if (isLoading) {
    return (
      <div className="container-narrow py-8 sm:py-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto mb-4" />
          <p className="text-navy/70">Carregando entrevista...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-narrow py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-navy">{session?.cargo}</h1>
          {session?.area && (
            <span className="text-navy/60 text-sm">{session.area}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Badge>Pergunta {questionNumber}/{totalQuestions}</Badge>
          <button
            onClick={handleAbandon}
            className="text-navy/60 hover:text-navy transition-colors"
            title="Sair da entrevista"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={questionNumber - 1} 
        max={totalQuestions}
        className="mb-6"
      />

      {/* Question Card */}
      <Card variant="elevated" className="mb-6">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-teal" />
            </div>
            <div>
              <p className="text-sm text-navy/60 mb-2">Entrevistador</p>
              <p className="text-lg text-navy leading-relaxed">
                {currentQuestion}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Answer Form */}
      <Card className="sticky bottom-4">
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-navy mb-2">
            Sua resposta
          </label>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            className="w-full h-40 p-4 rounded-lg border border-stone/40 bg-white text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
            disabled={isSubmitting}
            autoFocus
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-navy/60">
              <span className={answer.length < 50 ? 'text-amber' : 'text-teal'}>
                {answer.length}
              </span>
              <span> caracteres</span>
              {answer.length < 50 && (
                <span className="ml-2">(min: 50)</span>
              )}
              {answer.length >= 50 && answer.length < 200 && (
                <span className="ml-2 text-navy/40">(recomendado: 200+)</span>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || answer.length < 50}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {questionNumber === totalQuestions ? 'Finalizando...' : 'Enviando...'}
                </>
              ) : (
                <>
                  {questionNumber === totalQuestions ? 'Finalizar' : 'Enviar'}
                  <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-red-600 text-sm">{error}</p>
          )}
        </form>
      </Card>

      {/* Previous Q&A */}
      {session && session.answers && session.answers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-navy/60 mb-4">
            Perguntas anteriores
          </h3>
          <div className="space-y-4">
            {session.questions.slice(0, session.answers.length).map((q, i) => (
              <Card key={i} className="p-4 bg-white/50">
                <p className="text-sm text-navy/60 mb-1">Pergunta {i + 1}</p>
                <p className="text-navy font-medium mb-2">{q}</p>
                <p className="text-sm text-navy/80">{session.answers[i]}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
