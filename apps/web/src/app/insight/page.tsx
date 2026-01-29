'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, User, Mic } from 'lucide-react'
import {
  generateInsight,
  senioridadeLabels,
  areaLabels,
  statusLabels,
  objetivoLabels,
  type Insight,
} from '@/lib/insight-engine'
import type { EntryFlowData } from '@/lib/schemas/entry-flow'
import { useUser } from '@/hooks/use-user'
import { saveInsight } from './actions'

export default function InsightPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useUser()
  const [data, setData] = useState<EntryFlowData | null>(null)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)

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
      }, 1500)
    } catch {
      router.push('/comecar')
    }
  }, [router])

  // Salvar no sessionStorage para caso de signup posterior
  useEffect(() => {
    if (data && insight) {
      sessionStorage.setItem('pendingInsight', JSON.stringify({
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
    if (isLoggedIn && data && insight && !saved && !authLoading) {
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
          // Limpar sessionStorage ja que salvou no DB
          sessionStorage.removeItem('pendingInsight')
          sessionStorage.removeItem('entryFlowData')
        }
      })
    }
  }, [isLoggedIn, data, insight, saved, authLoading])

  const handleStartOver = () => {
    sessionStorage.removeItem('entryFlowData')
    router.push('/comecar')
  }

  if (isLoading) {
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
        {/* Context Summary */}
        <div className="mb-6">
          <p className="text-sm text-navy/60 mb-2">Baseado no que voce informou:</p>
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
                <p className="text-sm text-sand/70 mb-1">Recomendacao</p>
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
                Quer salvar e acompanhar?
              </h2>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Crie uma conta gratuita para salvar seus insights e receber 
                direcionamentos personalizados.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth">
                  <Button size="lg">
                    <User className="mr-2 w-5 h-5" />
                    Criar conta gratuita
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleStartOver}>
                  <RefreshCw className="mr-2 w-5 h-5" />
                  Comecar de novo
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Interview Pro Teaser */}
        <Card className="p-6 border-amber/30 bg-amber/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-amber" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-amber/20 text-amber">Pro</Badge>
              <h3 className="text-lg font-semibold text-navy mb-1">
                Prepare-se para a proxima entrevista
              </h3>
              <p className="text-navy/70 text-sm mb-3">
                Pratique com IA e receba feedback instantaneo sobre suas respostas.
              </p>
              <Link href="/interview-pro" className="text-sm font-medium text-amber hover:text-amber/80 transition-colors">
                Ver mais →
              </Link>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-sm text-navy/50">
          Este insight foi gerado com base nas informacoes que voce forneceu e serve como um ponto de partida para reflexao. Decisoes de carreira sao pessoais e devem considerar seu contexto completo.
        </p>
      </main>
    </div>
  )
}
