'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, User, MessageSquare, Clock } from 'lucide-react'
import {
  generateInsight,
  senioridadeLabels,
  areaLabels,
  statusLabels,
  objetivoLabels,
  type Insight,
} from '@/lib/insight-engine'
import { track } from '@/lib/analytics/track'
import type { EntryFlowData } from '@/lib/schemas/entry-flow'
import { useUser } from '@/hooks/use-user'
import { saveInsight, checkInsightAccess } from './actions'
import { UpgradePrompt } from '@/components/upgrade-prompt'

type AccessCheck = {
  allowed: boolean
  remaining: number | null
  limit: number | null
  plan: 'free' | 'pro' | null
}

export default function InsightPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useUser()
  const [data, setData] = useState<EntryFlowData | null>(null)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  // Check access when auth state changes
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      checkInsightAccess().then((access) => {
        setAccessCheck(access)
        if (!access.allowed) {
          setLimitReached(true)
          setIsLoading(false)
        }
      })
    }
  }, [authLoading, isLoggedIn])

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('entryFlowData')

    if (!storedData) {
      // Redirect to start if no data
      router.push('/comecar')
      return
    }

    try {
      const parsedData = JSON.parse(storedData) as EntryFlowData
      setData(parsedData)

      // Simulate processing time for better UX
      setTimeout(() => {
        const generatedInsight = generateInsight(parsedData)
        setInsight(generatedInsight)
        setIsLoading(false)

        // Track insight generation
        track('insight_generated', {
          cargo: parsedData.cargo,
          area: parsedData.area,
          senioridade: parsedData.senioridade,
        })
      }, 1500)
    } catch {
      router.push('/comecar')
    }
  }, [router])

  // Salvar no localStorage para caso de signup posterior (localStorage persiste entre tabs)
  useEffect(() => {
    if (data && insight) {
      localStorage.setItem('pendingInsight', JSON.stringify({
        cargo: data.cargo,
        senioridade: data.senioridade,
        area: data.area,
        status: data.status,
        tempoSituacao: data.tempoSituacao,
        urgencia: data.urgencia,
        objetivo: data.objetivo,
        objetivoOutro: data.objetivoOutro,
        recommendation: insight.recommendation,
        why: insight.why,
        risks: insight.risks,
        nextSteps: insight.nextSteps,
      }))
    }
  }, [data, insight])

  // Se ja logado, salvar no DB imediatamente
  useEffect(() => {
    if (isLoggedIn && data && insight && !saved && !authLoading && !limitReached) {
      // Check if localStorage still has the pending insight
      // If not, another tab (PendingInsightSaver) already saved it
      const pendingInsight = localStorage.getItem('pendingInsight')
      if (!pendingInsight) {
        console.log('[InsightPage] pendingInsight already removed, skipping save (likely saved by another tab)')
        setSaved(true)
        return
      }

      saveInsight({
        cargo: data.cargo,
        senioridade: data.senioridade,
        area: data.area,
        status: data.status,
        tempoSituacao: data.tempoSituacao,
        urgencia: data.urgencia,
        objetivo: data.objetivo,
        objetivoOutro: data.objetivoOutro,
        recommendation: insight.recommendation,
        why: insight.why,
        risks: insight.risks,
        nextSteps: insight.nextSteps,
      }).then((result) => {
        if (result.success) {
          setSaved(true)
          // Limpar localStorage/sessionStorage ja que salvou no DB
          localStorage.removeItem('pendingInsight')
          sessionStorage.removeItem('entryFlowData')
          // Update remaining count after save
          if (accessCheck && accessCheck.remaining !== null) {
            setAccessCheck({
              ...accessCheck,
              remaining: Math.max(0, accessCheck.remaining - 1)
            })
          }
        } else if ('limitReached' in result && result.limitReached) {
          setLimitReached(true)
        }
      })
    }
  }, [isLoggedIn, data, insight, saved, authLoading, limitReached, accessCheck])

  const handleStartOver = () => {
    sessionStorage.removeItem('entryFlowData')
    router.push('/comecar')
  }

  if (isLoading && !limitReached) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-navy" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Analisando seu contexto...</h2>
          <p className="text-navy/70">Preparando seu insight personalizado</p>
        </div>
      </div>
    )
  }

  // Show upgrade prompt if limit reached
  if (limitReached && accessCheck) {
    return (
      <div className="min-h-screen bg-sand">
        <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container-wide py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-navy" />
              </div>
              <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
            </Link>
          </div>
        </header>
        <main className="container-narrow py-8 sm:py-12">
          <UpgradePrompt
            remaining={accessCheck.remaining || 0}
            limit={accessCheck.limit || 3}
          />
        </main>
      </div>
    )
  }

  if (!data || !insight) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Remaining insights counter for Free users */}
        {isLoggedIn && accessCheck && accessCheck.plan === 'free' && accessCheck.remaining !== null && (
          <div className="mb-6 p-3 bg-amber/10 rounded-lg flex items-center justify-between">
            <p className="text-sm text-navy/70">
              <span className="font-medium text-navy">{accessCheck.remaining}</span> de {accessCheck.limit} insights restantes este mes
            </p>
            <Link href="/dashboard/plano" className="text-sm font-medium text-amber hover:text-amber/80">
              Upgrade →
            </Link>
          </div>
        )}

        {/* Context Summary */}
        <div className="mb-6">
          <p className="text-sm text-navy/60 mb-2">Baseado no que você informou:</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{data.cargo}</Badge>
            <Badge variant="info">{senioridadeLabels[data.senioridade]}</Badge>
            <Badge variant="info">{areaLabels[data.area]}</Badge>
            <Badge variant={data.status === 'empregado' ? 'success' : 'warning'}>
              {statusLabels[data.status]}
            </Badge>
            <Badge>{objetivoLabels[data.objetivo]}</Badge>
          </div>
        </div>

        {/* Decision Card */}
        <Card variant="elevated" className="mb-6 overflow-hidden">
          {/* Recommendation Header */}
          <div className="bg-navy text-sand p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-sm text-sand/70 mb-1">Recomendação</p>
                <h1 className="text-xl sm:text-2xl font-semibold">
                  {insight.recommendation}
                </h1>
              </div>
            </div>
          </div>

          {/* Why Section */}
          <div className="p-6 border-b border-stone/30">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Por que?
            </h2>
            <ul className="space-y-2">
              {insight.why.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks Section */}
          <div className="p-6 border-b border-stone/30 bg-amber/5">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Riscos a considerar
            </h2>
            <ul className="space-y-2">
              {insight.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps Section */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Proximos passos
            </h2>
            <ol className="space-y-3">
              {insight.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-navy">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-6 sm:p-8 text-center">
          {isLoggedIn ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-teal" />
                <h2 className="text-xl font-semibold text-navy">
                  Insight salvo!
                </h2>
              </div>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Voce pode acessar este e outros insights no seu dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="lg">
                    <ArrowRight className="mr-2 w-5 h-5" />
                    Ir para o Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleStartOver}>
                  <RefreshCw className="mr-2 w-5 h-5" />
                  Novo insight
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy mb-2">
                Quer continuar essa conversa?
              </h2>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Veja o que o Copilot pode te ajudar a responder:
              </p>

              {/* Chat Preview */}
              <div className="bg-sand rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                {/* User message */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-navy" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                    <p className="text-navy text-sm">
                      {data.objetivo === 'avaliar_proposta' && 'Qual salário devo pedir na negociação?'}
                      {data.objetivo === 'mais_entrevistas' && 'Como posso melhorar meu currículo para essa vaga?'}
                      {data.objetivo === 'mudar_area' && 'Quais skills preciso desenvolver primeiro?'}
                      {data.objetivo === 'negociar_salario' && 'Como devo abordar a conversa de aumento?'}
                      {data.objetivo === 'entender_mercado' && 'Qual a faixa salarial para meu perfil?'}
                      {!['avaliar_proposta', 'mais_entrevistas', 'mudar_area', 'negociar_salario', 'entender_mercado'].includes(data.objetivo) && 'O que você recomenda como próximo passo?'}
                    </p>
                  </div>
                </div>

                {/* Copilot response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-teal" />
                  </div>
                  <div className="bg-teal/10 rounded-lg rounded-tl-none p-3 flex-1">
                    <p className="text-navy text-sm">
                      Baseado no seu perfil de <span className="font-medium">{data.cargo}</span> com experiência em <span className="font-medium">{areaLabels[data.area]}</span>, posso te ajudar a...
                    </p>
                    <p className="text-teal text-xs mt-2 font-medium">
                      Crie uma conta para ver a resposta completa →
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Link href="/auth">
                  <Button size="lg">
                    <MessageSquare className="mr-2 w-5 h-5" />
                    Criar conta e continuar conversa
                  </Button>
                </Link>

                <p className="text-sm text-navy/50 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Leva menos de 1 minuto
                </p>

                <Button variant="ghost" size="sm" onClick={handleStartOver}>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Começar de novo
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-sm text-navy/50">
          Este insight foi gerado com base nas informações que você forneceu e serve como um ponto de partida para reflexão. Decisões de carreira são pessoais e devem considerar seu contexto completo.
        </p>
      </main>
    </div>
  )
}
