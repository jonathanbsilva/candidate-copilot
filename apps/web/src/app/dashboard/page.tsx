import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Badge } from '@ui/components'
import { ArrowRight, Mic, Briefcase, Trophy, TrendingUp, Crown } from 'lucide-react'
import { getDetailedStats } from './aplicacoes/actions'
import { getHeroData } from './actions'
import { getInterviewStats } from './interview-pro/actions'
import { PendingInsightSaver } from './_components/pending-insight-saver'
import { HeroCard } from './_components/hero-card'
import { StrategyCard } from './_components/strategy-card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stats = await getDetailedStats()
  const heroData = await getHeroData()
  const interviewStats = await getInterviewStats()

  // Buscar insight mais recente com campos completos
  const { data: latestInsight } = await supabase
    .from('insights')
    .select('id, recommendation, objetivo, cargo, next_steps, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Salva insight pendente automaticamente apos signup */}
      <PendingInsightSaver />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-navy mb-2">
          Bem-vindo ao seu Copilot
        </h1>
        <p className="text-navy/70">
          {user?.email}
        </p>
      </div>

      <div className="grid gap-6">
        {/* 1. Hero Card - Acao mais importante do momento */}
        {heroData && <HeroCard data={heroData} />}

        {/* 2. Aplicacoes - Resumo com mini funil */}
        <Card variant="elevated" className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">
                  Suas Aplicacoes
                </h2>
                {stats.total > 0 ? (
                  <p className="text-sm text-navy/60">
                    <span className="font-medium text-navy">{stats.total}</span> aplicacoes
                    {stats.em_andamento > 0 && (
                      <> • <span className="text-blue-600">{stats.em_andamento} em andamento</span></>
                    )}
                    {stats.propostas > 0 && (
                      <> • <span className="text-teal">{stats.propostas} proposta{stats.propostas > 1 ? 's' : ''}</span></>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-navy/60">
                    Organize sua busca, aumente suas chances
                  </p>
                )}
              </div>
            </div>
            <Link href="/dashboard/aplicacoes">
              <Button size="sm">
                {stats.total > 0 ? 'Ver todas' : 'Comecar'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {/* Mini vertical bars chart */}
          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-stone/20">
              <div className="flex items-end justify-between gap-2 h-12">
                {[
                  { key: 'aplicado', label: 'Aplicado', value: stats.aplicado, color: 'bg-stone/40' },
                  { key: 'emAnalise', label: 'Analise', value: stats.emAnalise, color: 'bg-blue-400' },
                  { key: 'entrevista', label: 'Entrevista', value: stats.entrevista, color: 'bg-amber' },
                  { key: 'proposta', label: 'Proposta', value: stats.proposta + stats.aceito, color: 'bg-teal' },
                ].map((item) => {
                  const maxValue = Math.max(stats.aplicado, stats.emAnalise, stats.entrevista, stats.proposta + stats.aceito, 1)
                  const heightPercent = (item.value / maxValue) * 100
                  return (
                    <div key={item.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end h-8">
                        {item.value > 0 && (
                          <span className="text-[10px] font-medium text-navy/70 mb-0.5">{item.value}</span>
                        )}
                        <div 
                          className={`w-full max-w-8 ${item.color} rounded-t transition-all`}
                          style={{ height: item.value > 0 ? `${Math.max(heightPercent, 15)}%` : '0%' }}
                        />
                      </div>
                      <span className="text-[10px] text-navy/50">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

        {/* 3. Estrategia - Insight ativo com proximos passos */}
        <StrategyCard insight={latestInsight} />

        {/* 4. Interview Pro - Contextual */}
        {interviewStats.plan === 'pro' && interviewStats.totalSessions > 0 ? (
          // Pro com sessoes - mostrar stats
          <Card variant="elevated" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy">
                    Interview Pro
                  </h2>
                  <p className="text-sm text-navy/60">
                    {interviewStats.totalSessions} treino{interviewStats.totalSessions > 1 ? 's' : ''} realizado{interviewStats.totalSessions > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/interview-pro">
                <Button size="sm">
                  Treinar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teal/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-teal mb-0.5">
                  <Trophy className="w-4 h-4" />
                  {interviewStats.averageScore || '-'}
                </div>
                <div className="text-[10px] text-teal/80">Score medio</div>
              </div>
              <div className="bg-stone/10 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-navy mb-0.5">
                  <TrendingUp className="w-4 h-4" />
                  {interviewStats.lastScore || '-'}
                </div>
                <div className="text-[10px] text-navy/60">Ultimo treino</div>
              </div>
            </div>
          </Card>
        ) : interviewStats.plan === 'pro' ? (
          // Pro sem sessoes - CTA para comecar
          <Card className="p-5 border-teal/30 bg-teal/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy">
                    Interview Pro
                  </h2>
                  <p className="text-sm text-navy/60">
                    Pratique e ganhe confianca
                  </p>
                </div>
              </div>
              <Link href="/dashboard/interview-pro">
                <Button size="sm">
                  Comecar primeiro treino
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          // Free - Upsell
          <Card className="p-5 border-amber/30 bg-amber/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-semibold text-navy">
                      Interview Pro
                    </h2>
                    <Badge className="bg-amber/20 text-amber text-[10px]">Pro</Badge>
                  </div>
                  <p className="text-sm text-navy/60">
                    Mock interviews com IA e feedback instantaneo
                  </p>
                </div>
              </div>
              <Link href="/dashboard/plano">
                <Button size="sm" variant="secondary">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
