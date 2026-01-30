'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Input, Badge } from '@ui/components'
import { ArrowLeft, ArrowRight, Loader2, Gift, Crown } from 'lucide-react'
import { createInterviewSession, getLastInsightData, checkInterviewAccess } from '../actions'
import { track } from '@/lib/analytics/track'

const senioridadeOptions = [
  { value: 'estagio', label: 'Estagio' },
  { value: 'junior', label: 'Junior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Senior' },
  { value: 'lideranca', label: 'Lideranca' },
]

const areaOptions = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'financas', label: 'Financas' },
  { value: 'rh', label: 'RH' },
  { value: 'operacoes', label: 'Operacoes' },
  { value: 'produto', label: 'Produto' },
  { value: 'design', label: 'Design' },
  { value: 'outro', label: 'Outro' },
]

type AccessInfo = {
  allowed: boolean
  plan: 'free' | 'pro' | null
  isTrialAvailable: boolean
}

export default function IniciarPage() {
  const router = useRouter()
  const [cargo, setCargo] = useState('')
  const [area, setArea] = useState('')
  const [senioridade, setSenioridade] = useState('')
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

      // Load last insight data
      const lastData = await getLastInsightData()
      if (lastData) {
        setCargo(lastData.cargo || '')
        setArea(lastData.area || '')
        setSenioridade(lastData.senioridade || '')
      }
      setIsLoadingData(false)
    }
    loadData()
  }, [])

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
            Voce ja usou sua entrevista de teste
          </h3>
          <p className="text-navy/70 mb-6">
            Faca upgrade para o plano Pro e tenha entrevistas ilimitadas.
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
                Configurar entrevista
              </h1>
              <p className="text-navy/70">
                Informe a vaga para perguntas personalizadas.
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
              Area
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
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparando entrevista...
              </>
            ) : (
              <>
                Comecar entrevista
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-navy/60">
            Sao 3 perguntas, dura cerca de 5 minutos.
          </p>
        </form>
      </Card>
    </div>
  )
}
