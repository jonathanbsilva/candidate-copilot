import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card } from '@ui/components'
import { Sparkles, LogOut, Plus, Briefcase, ArrowLeft } from 'lucide-react'
import { ApplicationCard } from './_components/application-card'
import { getApplications } from './actions'
import type { Application } from '@/lib/types/application'

export default async function AplicacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: applications, error } = await getApplications()

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
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
        {/* Back link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-1">
              Suas Aplicacoes
            </h1>
            <p className="text-navy/70">
              Acompanhe o status de todas as suas candidaturas
            </p>
          </div>
          <Link href="/dashboard/aplicacoes/nova">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Nova aplicacao
            </Button>
          </Link>
        </div>

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
              Nenhuma aplicacao ainda
            </h2>
            <p className="text-navy/60 mb-6 max-w-md mx-auto">
              Comece a rastrear suas candidaturas adicionando sua primeira aplicacao.
            </p>
            <Link href="/dashboard/aplicacoes/nova">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Adicionar primeira aplicacao
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
      </main>
    </div>
  )
}
