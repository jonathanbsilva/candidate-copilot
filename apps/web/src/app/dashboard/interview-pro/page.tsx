import Link from 'next/link'
import { Badge, Card, Button } from '@ui/components'
import { MessageSquare, BarChart3, TrendingUp, Phone, Mic, ArrowRight, History, Plus, Gift, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { canUseInterviewPro } from '@/lib/subscription/check-access'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { getInterviewHistory } from './actions'

export default async function InterviewProPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const access = await canUseInterviewPro(user.id)
  const recentSessions = await getInterviewHistory()

  // Show upgrade prompt if Free user without trial
  if (!access.allowed && access.plan === 'free') {
    return (
      <div className="container-narrow py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-2">
            Interview Pro
          </h1>
          <p className="text-navy/70">
            Treine para entrevistas com IA e receba feedback instantâneo.
          </p>
        </div>
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-amber" />
          </div>
          <h3 className="text-lg font-semibold text-navy mb-2">
            Você já usou sua entrevista de teste
          </h3>
          <p className="text-navy/70 mb-6 max-w-md mx-auto">
            Faça upgrade para o plano Pro e tenha entrevistas ilimitadas para praticar quando quiser.
          </p>
          <Link href="/dashboard/plano">
            <Button>
              <Crown className="w-5 h-5 mr-2" />
              Fazer upgrade para Pro
            </Button>
          </Link>
        </Card>
        
        {/* Show history if user has any */}
        {recentSessions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-navy mb-4">
              Sua entrevista anterior
            </h2>
            <div className="grid gap-4">
              {recentSessions.slice(0, 1).map((session) => (
                <Link key={session.id} href={`/dashboard/interview-pro/resultado/${session.id}`}>
                  <Card className="p-4 hover:border-teal/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-navy">{session.cargo}</p>
                        <p className="text-sm text-navy/60">
                          {new Date(session.completed_at!).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-navy">
                          {session.overall_score}
                        </span>
                        <span className="text-navy/60">/100</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Trial Banner for Free users */}
      {access.plan === 'free' && access.isTrialAvailable && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-teal/10 to-amber/10 border-teal/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy">
                Experimente o Interview Pro!
              </p>
              <p className="text-sm text-navy/70">
                Você tem 1 entrevista gratuita para testar. Aproveite!
              </p>
            </div>
            <Badge className="bg-teal/20 text-teal">1 grátis</Badge>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-2">
            Interview Pro
          </h1>
          <p className="text-navy/70">
            Treine para entrevistas com IA e receba feedback instantâneo.
          </p>
        </div>
        <Link href="/dashboard/interview-pro/iniciar" className="sm:ml-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            {access.plan === 'free' ? 'Usar meu trial' : 'Nova entrevista'}
          </Button>
        </Link>
      </div>

      {/* Mode Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Text Mode - Available */}
        <Card variant="elevated" className="p-6 border-teal/30">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-teal" />
            </div>
            <div>
              <Badge className="mb-2 bg-teal/20 text-teal">Disponível</Badge>
              <h3 className="text-xl font-semibold text-navy">
                Modo Texto
              </h3>
            </div>
          </div>
          <p className="text-navy/70 mb-6">
            Responda perguntas digitando. Ideal para quem quer pensar com calma e estruturar bem as respostas.
          </p>
          <ul className="space-y-2 text-sm text-navy/70 mb-6">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-teal rounded-full" />
              3 perguntas por sessão (~5 min)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-teal rounded-full" />
              Mix comportamental + técnico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-teal rounded-full" />
              Feedback detalhado no final
            </li>
          </ul>
          <Link href="/dashboard/interview-pro/iniciar">
            <Button className="w-full">
              Iniciar entrevista
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>

        {/* Audio Mode - Coming Soon */}
        <Card className="p-6 border-amber/30 bg-amber/5 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber/20 text-amber">Em breve</Badge>
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-navy mt-2">
                Modo Áudio
              </h3>
            </div>
          </div>
          <p className="text-navy/70 mb-6">
            Simule uma ligação real com IA. Treine sua comunicação verbal e tempo de resposta.
          </p>
          <ul className="space-y-2 text-sm text-navy/70 mb-6">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Conversa por voz em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Feedback sobre tom e clareza
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Gravação para revisão
            </li>
          </ul>
          <Button variant="secondary" className="w-full" disabled>
            Em breve
          </Button>
        </Card>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-navy">
              Sessões recentes
            </h2>
            <Link href="/dashboard/interview-pro/historico">
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4 mr-2" />
                Ver todas
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {recentSessions.slice(0, 3).map((session) => (
              <Link key={session.id} href={`/dashboard/interview-pro/resultado/${session.id}`}>
                <Card className="p-4 hover:border-teal/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy">{session.cargo}</p>
                      <p className="text-sm text-navy/60">
                        {new Date(session.completed_at!).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-navy">
                        {session.overall_score}
                      </span>
                      <span className="text-navy/60">/100</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">
          Como funciona
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-teal" />
            </div>
            <h3 className="font-medium text-navy mb-1">Perguntas reais</h3>
            <p className="text-sm text-navy/60">Baseadas no mercado brasileiro</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5 text-teal" />
            </div>
            <h3 className="font-medium text-navy mb-1">Feedback detalhado</h3>
            <p className="text-sm text-navy/60">Análise de cada resposta</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-teal" />
            </div>
            <h3 className="font-medium text-navy mb-1">Evolução visível</h3>
            <p className="text-sm text-navy/60">Acompanhe seu progresso</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
