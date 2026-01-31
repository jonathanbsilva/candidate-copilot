import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Plus, Briefcase, ArrowLeft, Crown, TrendingUp, Trophy } from 'lucide-react'
import { ApplicationCard } from './_components/application-card'
import { ApplicationFunnel } from './_components/application-funnel'
import { getApplications, checkApplicationAccess, getDetailedStats } from './actions'
import type { Application } from '@/lib/types/application'

export default async function AplicacoesPage() {
  const { data: applications, error } = await getApplications()
  const accessCheck = await checkApplicationAccess()
  const stats = await getDetailedStats()

  const canAdd = accessCheck?.allowed ?? true
  const isFree = accessCheck?.plan === 'free'

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
            Suas Aplicações
          </h1>
          <p className="text-navy/70">
            Acompanhe o status de todas as suas candidaturas
          </p>
        </div>
        {canAdd ? (
          <Link href="/dashboard/aplicacoes/nova">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Nova aplicação
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/plano">
            <Button>
              <Crown className="w-5 h-5 mr-2" />
              Fazer upgrade
            </Button>
          </Link>
        )}
      </div>

      {/* Stats boxes */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
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
      )}

      {/* Funnel visualization */}
      {stats.total > 0 && (
        <div className="mb-6">
          <ApplicationFunnel data={stats} />
        </div>
      )}

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

      {/* Error state */}
      {error && (
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {/* Empty state */}
      {!error && applications && applications.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-stone/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-navy/40" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">
            Nenhuma aplicação ainda
          </h2>
          <p className="text-navy/60 mb-6 max-w-md mx-auto">
            Comece a rastrear suas candidaturas adicionando sua primeira aplicação.
          </p>
          <Link href="/dashboard/aplicacoes/nova">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Adicionar primeira aplicação
            </Button>
          </Link>
        </Card>
      )}

      {/* Applications list */}
      {!error && applications && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((application: Application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  )
}
