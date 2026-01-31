import Link from 'next/link'
import { Button, Card, Badge, Progress } from '@ui/components'
import { ArrowLeft, ArrowRight, Plus, Calendar, Trophy } from 'lucide-react'
import { getInterviewHistory } from '../actions'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getScoreBadgeClass(score: number) {
  if (score >= 80) return 'bg-teal/20 text-teal'
  if (score >= 60) return 'bg-amber/20 text-amber'
  return 'bg-red-100 text-red-600'
}

export default async function HistoricoPage() {
  const sessions = await getInterviewHistory()

  // Calculate stats
  const stats = {
    total: sessions.length,
    avgScore: sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / sessions.length)
      : 0,
    bestScore: sessions.length > 0
      ? Math.max(...sessions.map(s => s.overall_score || 0))
      : 0,
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy">
          Histórico de entrevistas
        </h1>
        <Link href="/dashboard/interview-pro/iniciar">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nova
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-navy">{stats.total}</div>
            <div className="text-xs text-navy/60">Entrevistas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-teal">{stats.avgScore}</div>
            <div className="text-xs text-navy/60">Score médio</div>
          </Card>
          <Card className="p-4 text-center bg-amber/5">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 text-amber" />
              <span className="text-2xl font-bold text-amber">{stats.bestScore}</span>
            </div>
            <div className="text-xs text-navy/60">Melhor score</div>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-navy/40" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">
            Nenhuma entrevista ainda
          </h2>
          <p className="text-navy/70 mb-6">
            Complete sua primeira entrevista para ver seu histórico aqui.
          </p>
          <Link href="/dashboard/interview-pro/iniciar">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Iniciar primeira entrevista
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/dashboard/interview-pro/resultado/${session.id}`}>
              <Card className="p-5 hover:border-teal/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-navy">{session.cargo}</h3>
                    <div className="flex items-center gap-2 text-sm text-navy/60">
                      {session.area && <span>{session.area}</span>}
                      {session.area && session.senioridade && <span>•</span>}
                      {session.senioridade && <span>{session.senioridade}</span>}
                    </div>
                  </div>
                  <Badge className={getScoreBadgeClass(session.overall_score || 0)}>
                    {session.overall_score}/100
                  </Badge>
                </div>

                <Progress 
                  value={session.overall_score || 0} 
                  max={100}
                  className="mb-3"
                />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy/60">
                    {formatDate(session.completed_at!)}
                  </span>
                  <span className="text-teal flex items-center gap-1">
                    Ver detalhes
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Evolution tip */}
      {sessions.length >= 3 && (
        <Card className="mt-8 p-6 border-teal/30 bg-teal/5">
          <h3 className="font-semibold text-navy mb-2">
            Dica de evolução
          </h3>
          <p className="text-navy/70 text-sm">
            Você já fez {sessions.length} entrevistas! Continue praticando para melhorar 
            suas habilidades. Compare seus scores ao longo do tempo para ver seu progresso.
          </p>
        </Card>
      )}
    </div>
  )
}
