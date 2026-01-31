import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Badge } from '@ui/components'
import { ArrowRight, Mic, Briefcase, Trophy, TrendingUp, Crown, Gift } from 'lucide-react'
import { getDetailedStats } from './aplicacoes/actions'
import { getHeroData } from './actions'
import { getInterviewStats } from './interview-pro/actions'
import { canUseInterviewPro } from '@/lib/subscription/check-access'
import { PendingInsightSaver } from './_components/pending-insight-saver'
import { HeroCard } from './_components/hero-card'
import { StrategyCard } from './_components/strategy-card'
import {
  HeroCardSkeleton,
  StrategyCardSkeleton,
  ApplicationsCardSkeleton,
  InterviewCardSkeleton,
} from './_components/skeletons'

// ============================================
// Async Server Components para Suspense
// ============================================

async function HeroCardSection() {
  const heroData = await getHeroData()
  if (!heroData) return null
  return <HeroCard data={heroData} />
}

async function StrategyCardSection() {
  const supabase = await createClient()
  const { data: latestInsight } = await supabase
    .from('insights')
    .select('id, recommendation, objetivo, cargo, next_steps, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return <StrategyCard insight={latestInsight} />
}

async function ApplicationsSection() {
  const stats = await getDetailedStats()

  if (stats.total > 0) {
    return (
      <Card variant="elevated" className="p-4 sm:p-5">
        {/* Header - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-navy">
                Suas Aplicações
              </h2>
              <p className="text-xs sm:text-sm text-navy/60">
                <span className="font-medium text-navy">{stats.total}</span> aplicações
                {stats.em_andamento > 0 && (
                  <> • <span className="text-blue-600">{stats.em_andamento} em andamento</span></>
                )}
                {stats.propostas > 0 && (
                  <> • <span className="text-teal">{stats.propostas} proposta{stats.propostas > 1 ? 's' : ''}</span></>
                )}
              </p>
            </div>
          </div>
          <Link href="/dashboard/aplicacoes" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto whitespace-nowrap">
              Ver todas
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {/* Mini vertical bars chart */}
        <div className="mt-4 pt-4 border-t border-stone/20">
          <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-12">
            {[
              { key: 'aplicado', label: 'Aplicado', value: stats.aplicado, color: 'bg-stone/40' },
              { key: 'emAnalise', label: 'Análise', value: stats.emAnalise, color: 'bg-blue-400' },
              { key: 'entrevista', label: 'Entrevista', value: stats.entrevista, color: 'bg-amber' },
              { key: 'proposta', label: 'Proposta', value: stats.proposta + stats.aceito, color: 'bg-teal' },
            ].map((item) => {
              const maxValue = Math.max(stats.aplicado, stats.emAnalise, stats.entrevista, stats.proposta + stats.aceito, 1)
              const heightPercent = (item.value / maxValue) * 100
              return (
                <div key={item.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-8">
                    {item.value > 0 && (
                      <span className="text-xs font-medium text-navy/70 mb-0.5">{item.value}</span>
                    )}
                    <div 
                      className={`w-full max-w-6 sm:max-w-8 ${item.color} rounded-t transition-all`}
                      style={{ height: item.value > 0 ? `${Math.max(heightPercent, 15)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-navy/50 truncate max-w-full">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    )
  }

  // Empty state
  return (
    <Card className="p-4 sm:p-6 border-teal/30 bg-teal/5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-teal" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-navy">
            Comece a organizar sua busca
          </h2>
          <p className="text-navy/60 text-sm sm:text-base">
            Acompanhe suas aplicações e aumente suas chances
          </p>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-navy/70">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-stone/40" />
            <span>Aplicado</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Em análise</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-amber" />
            <span>Entrevista</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-teal" />
            <span>Proposta</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Link href="/dashboard/aplicacoes/nova" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            Adicionar primeira vaga
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}

async function InterviewSection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [interviewStats, interviewAccess] = await Promise.all([
    getInterviewStats(),
    user ? canUseInterviewPro(user.id) : Promise.resolve(null),
  ])

  if (interviewStats.totalSessions > 0) {
    // Usuário com sessões (Pro ou Free que usou trial) - mostrar stats
    return (
      <Card variant="elevated" className="p-4 sm:p-5">
        {/* Header - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-navy">
                Entrevista IA
              </h2>
              <p className="text-xs sm:text-sm text-navy/60">
                {interviewStats.totalSessions} treino{interviewStats.totalSessions > 1 ? 's' : ''} realizado{interviewStats.totalSessions > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">
              {interviewAccess?.allowed ? 'Treinar' : 'Ver resultado'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-teal/10 rounded-lg p-2.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-lg sm:text-xl font-bold text-teal mb-0.5">
              <Trophy className="w-4 h-4" />
              {interviewStats.averageScore || '-'}
            </div>
            <div className="text-xs text-teal/80">Score médio</div>
          </div>
          <div className="bg-stone/10 rounded-lg p-2.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-lg sm:text-xl font-bold text-navy mb-0.5">
              <TrendingUp className="w-4 h-4" />
              {interviewStats.lastScore || '-'}
            </div>
            <div className="text-xs text-navy/60">Último treino</div>
          </div>
        </div>
        
        {/* Upsell para Free que usou trial */}
        {interviewStats.plan === 'free' && !interviewAccess?.isTrialAvailable && (
          <div className="mt-3 pt-3 border-t border-stone/20">
            <Link href="/dashboard/plano">
              <Button size="sm" variant="ghost" className="w-full text-amber hover:text-amber">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade para treinos ilimitados
              </Button>
            </Link>
          </div>
        )}
      </Card>
    )
  }

  if (interviewStats.plan === 'pro') {
    // Pro sem sessões - CTA para começar
    return (
      <Card className="p-4 sm:p-5 border-teal/30 bg-teal/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-navy">
                Entrevista IA
              </h2>
              <p className="text-xs sm:text-sm text-navy/60">
                Pratique e ganhe confiança
              </p>
            </div>
          </div>
          <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">
              Começar primeiro treino
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  if (interviewAccess?.isTrialAvailable) {
    // Free com trial disponível - CTA para experimentar
    return (
      <Card className="p-4 sm:p-6 border-teal/30 bg-gradient-to-r from-teal/5 to-amber/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-teal" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="text-lg sm:text-xl font-semibold text-navy">
                Entrevista IA
              </h2>
              <Badge className="bg-teal/20 text-teal text-xs flex items-center gap-1">
                <Gift className="w-3 h-3" />
                1 grátis
              </Badge>
            </div>
            <p className="text-navy/60 text-sm sm:text-base">
              Treine para entrevistas com IA e ganhe confiança
            </p>
          </div>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-navy/70 mb-2">
            Sua entrevista gratuita inclui:
          </p>
          <ul className="space-y-1 text-xs sm:text-sm text-navy/70">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
              3 perguntas personalizadas para sua área
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
              Feedback detalhado de cada resposta
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
              Score e dicas de melhoria
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              Fazer minha entrevista grátis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  // Free sem trial - Upsell
  return (
    <Card className="p-4 sm:p-5 border-amber/30 bg-amber/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-amber" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="text-base sm:text-lg font-semibold text-navy">
                Entrevista IA
              </h2>
              <Badge className="bg-amber/20 text-amber text-xs">Pro</Badge>
            </div>
            <p className="text-xs sm:text-sm text-navy/60">
              Mock interviews com IA e feedback instantâneo
            </p>
          </div>
        </div>
        <Link href="/dashboard/plano" className="w-full sm:w-auto">
          <Button size="sm" variant="secondary" className="w-full sm:w-auto">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// ============================================
// Main Page Component
// ============================================

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Salva insight pendente automaticamente após signup */}
      <PendingInsightSaver />

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-2">
          Bem-vindo ao seu Copilot
        </h1>
        <p className="text-navy/70">
          {user?.email}
        </p>
      </div>

      <div className="grid gap-6">
        {/* 1. Hero Card - Ação mais importante do momento */}
        <Suspense fallback={<HeroCardSkeleton />}>
          <HeroCardSection />
        </Suspense>

        {/* 2. Estrategia - Insight ativo com próximos passos */}
        <Suspense fallback={<StrategyCardSkeleton />}>
          <StrategyCardSection />
        </Suspense>

        {/* 3. Aplicações - Resumo com mini funil */}
        <Suspense fallback={<ApplicationsCardSkeleton />}>
          <ApplicationsSection />
        </Suspense>

        {/* 4. Entrevista IA - Contextual */}
        <Suspense fallback={<InterviewCardSkeleton />}>
          <InterviewSection />
        </Suspense>
      </div>
    </div>
  )
}
