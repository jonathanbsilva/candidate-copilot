import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, LogOut, ArrowRight, Mic, Briefcase, TrendingUp, Trophy } from 'lucide-react'
import { getApplicationStats } from './aplicacoes/actions'
import { PendingInsightSaver } from './_components/pending-insight-saver'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const stats = await getApplicationStats()

  // Buscar insights do usuario
  const { data: insights } = await supabase
    .from('insights')
    .select('id, recommendation, objetivo, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

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
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Salva insight pendente automaticamente apos signup */}
        <PendingInsightSaver />

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-navy mb-2">
            Bem-vindo ao seu Copilot
          </h1>
          <p className="text-navy/70">
            {user.email}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Applications Card */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-navy">
                    Suas Aplicacoes
                  </h2>
                  <p className="text-sm text-navy/60">
                    Acompanhe suas candidaturas
                  </p>
                </div>
              </div>
              <Link href="/dashboard/aplicacoes">
                <Button size="sm">
                  Ver todas
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-stone/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy mb-1">{stats.total}</div>
                <div className="text-xs text-navy/60">Total</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-700 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  {stats.em_andamento}
                </div>
                <div className="text-xs text-blue-600">Em andamento</div>
              </div>
              <div className="bg-teal/10 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-teal mb-1">
                  <Trophy className="w-5 h-5" />
                  {stats.propostas}
                </div>
                <div className="text-xs text-teal">Propostas</div>
              </div>
            </div>

            {stats.total === 0 && (
              <div className="mt-4 pt-4 border-t border-stone/20">
                <p className="text-sm text-navy/60 mb-3">
                  Comece a rastrear suas candidaturas para ter uma visao clara do seu progresso.
                </p>
                <Link href="/dashboard/aplicacoes/nova">
                  <Button variant="secondary" size="sm">
                    Adicionar primeira aplicacao
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-navy mb-2">
              Comece sua jornada
            </h2>
            <p className="text-navy/70 mb-4">
              Responda algumas perguntas para receber insights personalizados sobre sua carreira.
            </p>
            <Link href="/comecar">
              <Button>
                Novo insight
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Seus insights
            </h2>
            {insights && insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight) => (
                  <li key={insight.id} className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-navy font-medium">{insight.recommendation}</p>
                      <p className="text-sm text-navy/60">
                        {formatDate(insight.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-navy/50 text-sm">
                Seus insights salvos aparecerao aqui. Comece gerando seu primeiro insight!
              </p>
            )}
          </Card>

          {/* Interview Pro Teaser */}
          <Card className="p-6 border-amber/30 bg-amber/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-amber" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2 bg-amber/20 text-amber">Em breve</Badge>
                <h3 className="text-lg font-semibold text-navy mb-1">
                  Interview Pro
                </h3>
                <p className="text-navy/70 text-sm mb-3">
                  Mock interviews com IA. Pratique e receba feedback instantaneo.
                </p>
                <Link href="/interview-pro" className="text-sm font-medium text-amber hover:text-amber/80 transition-colors">
                  Entrar na lista →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
