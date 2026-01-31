'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Input, Badge } from '@ui/components'
import { ArrowLeft, ArrowRight, Loader2, Gift, Crown } from 'lucide-react'
import { createInterviewSession, getLastInsightData, checkInterviewAccess, getUserApplications, type ActiveApplication } from '../actions'
import { track } from '@/lib/analytics/track'
import { ContextSelector, type ContextOption, type ContextData } from './context-selector'

const senioridadeOptions = [
  { value: 'estagio', label: 'Estágio' },
  { value: 'junior', label: 'Junior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'lideranca', label: 'Liderança' },
]

const areaOptions = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'financas', label: 'Finanças' },
  { value: 'rh', label: 'RH' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'produto', label: 'Produto' },
  { value: 'design', label: 'Design' },
  { value: 'outro', label: 'Outro' },
]

type AccessInfo = {
  allowed: boolean
  plan: 'free' | 'pro' | null
  isTrialAvailable: boolean
}

type LastInsightData = {
  cargo?: string
  area?: string
  senioridade?: string
}

export default function IniciarPage() {
  const router = useRouter()
  
  // Step management
  const [step, setStep] = useState<'context' | 'form'>('context')
  const [contextData, setContextData] = useState<ContextData | null>(null)
  
  // Form fields
  const [cargo, setCargo] = useState('')
  const [area, setArea] = useState('')
  const [senioridade, setSenioridade] = useState('')
  const [company, setCompany] = useState('')
  
  // Data loading
  const [applications, setApplications] = useState<ActiveApplication[]>([])
  const [lastInsight, setLastInsight] = useState<LastInsightData | null>(null)
  
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null)

  useEffect(() => {
    async function loadData() {
      // Check access
      const access = await checkInterviewAccess()
      setAccessInfo(access)
      
      if (!access.allowed) {
        setIsLoadingData(false)
        return
      }

      // Load data in parallel
      const [insightData, appsData] = await Promise.all([
        getLastInsightData(),
        getUserApplications(),
      ])
      
      setLastInsight(insightData)
      setApplications(appsData)
      
      // If no applications and no insight, skip to form step
      if (appsData.length === 0 && !insightData?.cargo) {
        setStep('form')
      }
      
      setIsLoadingData(false)
    }
    loadData()
  }, [])
  
  // Handle context selection
  const handleContextSelect = (option: ContextOption, data?: ContextData) => {
    if (option === 'manual') {
      // Go to form with empty fields
      setContextData({ source: 'manual' })
      setStep('form')
      return
    }
    
    if (data) {
      setContextData(data)
      
      // Pre-fill form based on selection
      if (data.source === 'job' && data.jobTitle) {
        setCargo(data.jobTitle)
        setCompany(data.company || '')
      } else if (data.source === 'insight') {
        setCargo(data.cargo || '')
        setArea(data.area || '')
        setSenioridade(data.senioridade || '')
      }
      
      setStep('form')
    }
  }
  
  // Go back to context selection
  const handleBackToContext = () => {
    setStep('context')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cargo.trim()) {
      setError('Informe o cargo')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await createInterviewSession({
        cargo: cargo.trim(),
        area: area || undefined,
        senioridade: senioridade || undefined,
        company: company.trim() || undefined,
        source: contextData?.source || 'manual',
        applicationId: contextData?.applicationId,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.session) {
        track('interview_started', {
          cargo,
          area,
          senioridade,
          company: company || undefined,
          source: contextData?.source || 'manual',
        })
        router.push(`/dashboard/interview-pro/sessao/${result.session.id}`)
      }
    } catch (err) {
      setError('Erro ao iniciar entrevista. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container-narrow py-8 sm:py-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto mb-4" />
          <p className="text-navy/70">Carregando...</p>
        </div>
      </div>
    )
  }

  if (accessInfo && !accessInfo.allowed) {
    return (
      <div className="container-narrow py-8 sm:py-12">
        <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
        <Card className="p-6 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-amber" />
          </div>
          <h3 className="text-lg font-semibold text-navy mb-2">
            Você já usou sua entrevista de teste
          </h3>
          <p className="text-navy/70 mb-6">
            Faça upgrade para o plano Pro e tenha entrevistas ilimitadas.
          </p>
          <Link href="/dashboard/plano">
            <Button>
              <Crown className="w-5 h-5 mr-2" />
              Fazer upgrade para Pro
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Step 1: Context Selection
  if (step === 'context') {
    return (
      <div className="container-narrow py-8 sm:py-12">
        <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <Card variant="elevated" className="max-w-lg mx-auto">
          <div className="p-6 border-b border-stone/30">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-navy mb-2">
                  Escolher contexto
                </h1>
                <p className="text-navy/70">
                  Selecione como quer se preparar para a entrevista.
                </p>
              </div>
              {accessInfo?.plan === 'free' && accessInfo.isTrialAvailable && (
                <Badge className="bg-teal/20 text-teal flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Trial
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6">
            <ContextSelector
              applications={applications}
              lastInsight={lastInsight}
              onSelect={handleContextSelect}
            />
          </div>
        </Card>
      </div>
    )
  }

  // Step 2: Form
  return (
    <div className="container-narrow py-8 sm:py-12">
      <button
        onClick={handleBackToContext}
        className="inline-flex items-center text-navy/70 hover:text-navy mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </button>

      <Card variant="elevated" className="max-w-lg mx-auto">
        <div className="p-6 border-b border-stone/30">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-navy mb-2">
                Configurar entrevista
              </h1>
              <p className="text-navy/70">
                {contextData?.source === 'job' 
                  ? `Treinando para vaga em ${contextData.company}`
                  : 'Confirme os dados para perguntas personalizadas.'}
              </p>
            </div>
            {accessInfo?.plan === 'free' && accessInfo.isTrialAvailable && (
              <Badge className="bg-teal/20 text-teal flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Trial
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Cargo / Vaga *
            </label>
            <Input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Desenvolvedor Frontend"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Empresa (opcional)
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex: TechCorp"
            />
            <p className="text-xs text-navy/50 mt-1">
              Ajuda a gerar perguntas mais específicas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Área
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-stone/40 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {areaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Senioridade
            </label>
            <select
              value={senioridade}
              onChange={(e) => setSenioridade(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-stone/40 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {senioridadeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparando entrevista...
              </>
            ) : (
              <>
                Começar entrevista
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-navy/60">
            São 3 perguntas, dura cerca de 5 minutos.
          </p>
        </form>
      </Card>
    </div>
  )
}
