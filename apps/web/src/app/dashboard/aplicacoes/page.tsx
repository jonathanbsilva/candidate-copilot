import { Suspense } from 'react'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Plus, Briefcase, ArrowLeft, Crown, TrendingUp, Trophy, Users, TrendingDown, Minus, Lock, BarChart3 } from 'lucide-react'
import { ApplicationCard } from './_components/application-card'
import { RetryButton } from './_components/retry-button'
import { BenchmarkCopilotButton } from './_components/benchmark-copilot-button'
import { getApplications, checkApplicationAccess, getDetailedStats } from './actions'
import { getDashboardMetrics, getBenchmarkMetrics } from '../actions'
import { StatsAndFunnelSkeleton, ApplicationsListSkeleton } from '../_components/skeletons'
import type { Application } from '@/lib/types/application'

const MIN_APPS_FOR_BENCHMARK = 3

// ============================================
// Async Server Components para Suspense
// ============================================

async function StatsAndFunnelSection() {
  const [accessCheck, stats, dashboardMetrics] = await Promise.all([
    checkApplicationAccess(),
    getDetailedStats(),
    getDashboardMetrics(),
  ])

  const benchmark = stats.total >= MIN_APPS_FOR_BENCHMARK 
    ? await getBenchmarkMetrics(dashboardMetrics)
    : null

  const isFree = accessCheck?.plan === 'free'
  const canAdd = accessCheck?.allowed ?? true

  // Calcular taxa de conversão
  const taxaConversao = stats.total > 0 
    ? Math.round(((stats.entrevista + stats.proposta + stats.aceito) / stats.total) * 100) 
    : 0

  // Funil data para visualização
  const funnelStages = [
    { key: 'aplicado', label: 'Aplicado', value: stats.aplicado, color: 'bg-stone/50' },
    { key: 'emAnalise', label: 'Em Análise', value: stats.emAnalise, color: 'bg-blue-400' },
    { key: 'entrevista', label: 'Entrevista', value: stats.entrevista, color: 'bg-amber' },
    { key: 'proposta', label: 'Proposta', value: stats.proposta + stats.aceito, color: 'bg-teal' },
  ]
  const maxFunnelValue = Math.max(...funnelStages.map(s => s.value), 1)

  return (
    <>
      {/* Stats Card - Layout: Funil | Taxa de Conversão */}
      {stats.total > 0 && (
        <Card className="p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-navy/50" />
            <h3 className="text-sm font-medium text-navy/60">Suas Métricas</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Barras do funil */}
            <div className="flex-1">
              <div className="flex items-end justify-between gap-2">
                {funnelStages.map((stage) => {
                  const heightPercent = (stage.value / maxFunnelValue) * 100
                  // Altura em pixels: min 8px, max 48px
                  const barHeight = stage.value > 0 ? Math.max(heightPercent * 0.48, 8) : 2
                  return (
                    <div key={stage.key} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-navy/70">{stage.value}</span>
                      <div 
                        className={`w-full max-w-8 sm:max-w-12 ${stage.color} rounded-t transition-all duration-500`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-xs text-navy/50 whitespace-nowrap">{stage.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Divisor */}
            <div className="hidden sm:block w-px self-stretch bg-stone/20" />
            <div className="sm:hidden h-px w-full bg-stone/20" />
            
            {/* Taxa de conversão */}
            <div className="flex-shrink-0 sm:w-44 text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal">{taxaConversao}%</div>
              <div className="text-sm font-medium text-navy/70 mt-1 sm:mt-2">Taxa de conversão</div>
              <div className="text-xs text-navy/50 mt-1 leading-relaxed">
                % que avançaram para entrevista ou proposta
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Benchmark Card - Comparação com base global */}
      <BenchmarkSection 
        userMetrics={dashboardMetrics} 
        benchmark={benchmark} 
        totalApps={stats.total}
      />

      {/* Limit indicator for free users */}
      {isFree && accessCheck && (
        <div className={`mb-6 p-3 rounded-lg flex items-center justify-between ${
          canAdd ? 'bg-stone/10' : 'bg-amber/10'
        }`}>
          <p className="text-sm text-navy/70">
            <span className="font-medium text-navy">{accessCheck.current}</span> de {accessCheck.limit} vagas usadas
            {!canAdd && <span className="text-amber ml-2">• Limite atingido</span>}
          </p>
          {!canAdd && (
            <Link href="/dashboard/plano" className="text-sm font-medium text-amber hover:text-amber/80">
              Upgrade →
            </Link>
          )}
        </div>
      )}
    </>
  )
}

// Componente de Benchmark com estado bloqueado e visual impactante
function BenchmarkSection({ 
  userMetrics, 
  benchmark,
  totalApps
}: { 
  userMetrics: { taxaConversao: number }
  benchmark: { taxaConversaoMedia: number; percentilUsuario: number; totalUsuariosAtivos: number } | null
  totalApps: number
}) {
  // Não mostra benchmark se não tem nenhuma aplicação (evita múltiplos CTAs)
  if (totalApps === 0) {
    return null
  }

  const appsNeeded = MIN_APPS_FOR_BENCHMARK - totalApps
  const isLocked = totalApps < MIN_APPS_FOR_BENCHMARK

  // Estado bloqueado - mostra preview atraente com dados fake
  if (isLocked) {
    // Dados fake para preview atraente
    const fakeUserTaxa = 25
    const fakeMediaTaxa = 21
    const fakeDiff = 4
    
    return (
      <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-br from-teal/5 via-transparent to-blue-50/30 relative overflow-hidden">
        {/* Conteúdo com blur - mesma estrutura do desbloqueado */}
        <div className="blur-[4px] select-none pointer-events-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal" />
              <span className="text-sm font-medium text-navy">Como você se compara</span>
              <Badge variant="info" className="text-[10px]">Beta</Badge>
            </div>
            <span className="text-xs text-navy/50">
              127 usuários ativos
            </span>
          </div>

          {/* Comparação visual fake */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 mb-5">
            <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 lg:gap-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">{fakeUserTaxa}%</div>
                <div className="text-sm text-navy/60 mt-1">Sua taxa</div>
                <div className="w-20 sm:w-24 h-2 bg-stone/10 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-navy rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              
              <div className="text-xl sm:text-2xl font-light text-navy/30">vs</div>
              
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy/40">{fakeMediaTaxa}%</div>
                <div className="text-sm text-navy/60 mt-1">Média</div>
                <div className="w-20 sm:w-24 h-2 bg-stone/10 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-stone/40 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-px self-stretch bg-stone/20" />
            <div className="lg:hidden h-px w-full bg-stone/20" />

            <div className="flex-shrink-0 lg:w-64">
              <div className="p-3 sm:p-4 rounded-xl bg-teal/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-teal" />
                  <span className="text-base sm:text-lg font-semibold text-teal">
                    +{fakeDiff}% acima da média!
                  </span>
                </div>
                <p className="text-sm text-navy/70">
                  Você está no <strong>top 30%</strong> dos usuários
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overlay elegante com CTA */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/80 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-stone/10 mb-3">
              <Lock className="w-4 h-4 text-navy/50" />
              <span className="text-sm font-medium text-navy">
                Adicione mais {appsNeeded} candidatura{appsNeeded > 1 ? 's' : ''} para desbloquear
              </span>
            </div>
            <p className="text-sm text-navy/70 mb-4 max-w-xs">
              Descubra se você está acima ou abaixo da média e receba dicas personalizadas
            </p>
            <Link href="/dashboard/aplicacoes/nova">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Adicionar candidatura
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Se não tem benchmark data (erro ou aguardando), não renderiza
  if (!benchmark) {
    return null
  }

  const diff = userMetrics.taxaConversao - benchmark.taxaConversaoMedia
  const isAbove = diff > 0
  const isEqual = diff === 0
  const topPercent = 100 - benchmark.percentilUsuario

  // Preparar contexto para o Copilot
  const benchmarkContext = {
    userTaxa: userMetrics.taxaConversao,
    mediaTaxa: benchmark.taxaConversaoMedia,
    percentil: benchmark.percentilUsuario,
    totalUsuarios: benchmark.totalUsuariosAtivos,
    diff: diff,
    isAbove: isAbove,
  }

  return (
    <Card className="p-5 sm:p-6 mb-6 bg-gradient-to-br from-teal/5 via-transparent to-blue-50/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal" />
          <span className="text-sm font-medium text-navy">Como você se compara</span>
          <Badge variant="info" className="text-[10px]">Beta</Badge>
        </div>
        <span className="text-xs text-navy/50">
          {benchmark.totalUsuariosAtivos} usuários ativos
        </span>
      </div>

      {/* Comparação visual */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 mb-5">
        {/* Taxa do usuário vs média */}
        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 lg:gap-10">
          {/* Sua taxa */}
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">{userMetrics.taxaConversao}%</div>
            <div className="text-sm text-navy/60 mt-1">Sua taxa</div>
            {/* Barra visual */}
            <div className="w-20 sm:w-24 h-2 bg-stone/10 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-navy rounded-full"
                style={{ width: `${Math.min(userMetrics.taxaConversao * 2, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="text-xl sm:text-2xl font-light text-navy/30">vs</div>
          
          {/* Média da plataforma */}
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy/40">{benchmark.taxaConversaoMedia}%</div>
            <div className="text-sm text-navy/60 mt-1">Média</div>
            {/* Barra visual */}
            <div className="w-20 sm:w-24 h-2 bg-stone/10 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-stone/40 rounded-full"
                style={{ width: `${Math.min(benchmark.taxaConversaoMedia * 2, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="hidden lg:block w-px self-stretch bg-stone/20" />
        <div className="lg:hidden h-px w-full bg-stone/20" />

        {/* Resultado */}
        <div className="flex-shrink-0 lg:w-64">
          <div className={`p-3 sm:p-4 rounded-xl ${
            isAbove ? 'bg-teal/10' : isEqual ? 'bg-stone/10' : 'bg-amber/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isAbove ? (
                <TrendingUp className="w-5 h-5 text-teal" />
              ) : isEqual ? (
                <Minus className="w-5 h-5 text-navy/60" />
              ) : (
                <TrendingDown className="w-5 h-5 text-amber" />
              )}
              <span className={`text-base sm:text-lg font-semibold ${
                isAbove ? 'text-teal' : isEqual ? 'text-navy/70' : 'text-amber'
              }`}>
                {isAbove 
                  ? `+${Math.abs(diff)}% acima da média!`
                  : isEqual 
                  ? 'Na média'
                  : `${Math.abs(diff)}% abaixo da média`
                }
              </span>
            </div>
            {benchmark.percentilUsuario > 0 && isAbove && (
              <p className="text-sm text-navy/70">
                Você está no <strong>top {topPercent}%</strong> dos usuários
              </p>
            )}
            {!isAbove && !isEqual && (
              <p className="text-sm text-navy/70">
                Pequenos ajustes podem fazer grande diferença
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botão do Copilot */}
      <div className="flex justify-end">
        <BenchmarkCopilotButton context={benchmarkContext} />
      </div>
    </Card>
  )
}

async function ApplicationsListSection() {
  const { data: applications, error } = await getApplications()

  // Error state
  if (error) {
    return (
      <Card className="p-4 sm:p-6 text-center">
        <p role="alert" className="text-red-600 mb-4">{error}</p>
        <RetryButton />
      </Card>
    )
  }

  // Empty state
  if (!applications || applications.length === 0) {
    return (
      <Card className="p-4 sm:p-6 md:p-8 text-center">
        <div className="w-16 h-16 bg-stone/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-navy/40" />
        </div>
        <h2 className="text-xl font-semibold text-navy mb-2">
          Nenhuma candidatura ainda
        </h2>
        <p className="text-navy/60 mb-6 max-w-md mx-auto">
          Comece a rastrear suas candidaturas adicionando sua primeira candidatura.
        </p>
        <Link href="/dashboard/aplicacoes/nova">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Adicionar primeira candidatura
          </Button>
        </Link>
      </Card>
    )
  }

  // Applications list
  return (
    <div className="space-y-3">
      {applications.map((application: Application) => (
        <ApplicationCard key={application.id} application={application} />
      ))}
    </div>
  )
}

async function HeaderActionsSection() {
  const accessCheck = await checkApplicationAccess()
  const canAdd = accessCheck?.allowed ?? true

  if (canAdd) {
    return (
      <Link href="/dashboard/aplicacoes/nova">
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Nova candidatura
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/dashboard/plano">
      <Button>
        <Crown className="w-5 h-5 mr-2" />
        Fazer upgrade
      </Button>
    </Link>
  )
}

// Skeleton simples para o botão do header
function HeaderActionSkeleton() {
  return <div className="w-36 h-10 animate-pulse bg-stone/20 rounded-lg" />
}

// ============================================
// Main Page Component
// ============================================

export default async function AplicacoesPage() {
  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Back link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-1">
            Suas Candidaturas
          </h1>
          <p className="text-navy/70">
            Acompanhe o status de todas as suas candidaturas
          </p>
        </div>
        <Suspense fallback={<HeaderActionSkeleton />}>
          <HeaderActionsSection />
        </Suspense>
      </div>

      {/* Stats and Funnel */}
      <Suspense fallback={<StatsAndFunnelSkeleton />}>
        <StatsAndFunnelSection />
      </Suspense>

      {/* Applications list */}
      <Suspense fallback={<ApplicationsListSkeleton />}>
        <ApplicationsListSection />
      </Suspense>
    </div>
  )
}
