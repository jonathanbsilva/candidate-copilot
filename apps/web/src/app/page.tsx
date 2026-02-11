import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, Target, Clock, ArrowRight, Mic } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const CopilotShowcase = dynamic(
  () => import('./_components/copilot-showcase').then(mod => ({ default: mod.CopilotShowcase })),
  { ssr: false }
)

function HeaderSkeleton() {
  return (
    <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-wide py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-navy" />
          </div>
          <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-navy/70 hover:text-navy transition-colors hidden sm:block">
            Preços
          </Link>
          <div className="w-20 h-8 bg-stone/20 rounded animate-pulse" />
        </div>
      </div>
    </header>
  )
}

async function AuthHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-wide py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-navy" />
          </div>
          <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-navy/70 hover:text-navy transition-colors hidden sm:block">
            Preços
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <AuthHeader />
      </Suspense>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="container-narrow text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy leading-tight tracking-tight">
              Decisões de carreira com clareza, não com ansiedade.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-navy/70 max-w-2xl mx-auto">
              Responda algumas perguntas e receba um primeiro direcionamento baseado no seu contexto. Sem cadastro, sem enrolação.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/comecar">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver minha primeira análise
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-navy/50 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Leva menos de 2 minutos
            </p>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy text-center mb-12">
              Como funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal">1</span>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Conte seu contexto
                </h3>
                <p className="text-navy/70">
                  Responda 4 perguntas simples sobre sua situação profissional atual e o que você quer resolver.
                </p>
              </Card>

              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber">2</span>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Receba uma análise
                </h3>
                <p className="text-navy/70">
                  Com base no que você informou, receba um diagnóstico claro com padrões identificados e próximo passo.
                </p>
              </Card>

              <Card className="text-center p-6 sm:p-8">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-navy">3</span>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Tome decisões melhores
                </h3>
                <p className="text-navy/70">
                  Use as análises para tomar decisões de carreira com mais confiança e menos ansiedade.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-6">
                  Para quem está pensando em...
                </h2>
                <ul className="space-y-4">
                  {[
                    'Avaliar uma proposta de emprego',
                    'Conseguir mais entrevistas',
                    'Avançar em processos seletivos',
                    'Negociar salário atual',
                    'Mudar de área ou carreira',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-navy/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card variant="elevated" className="p-6 sm:p-8">
                <blockquote className="text-base sm:text-lg text-navy/80 italic">
                  "Em vez de ficar dias remoendo uma decisão, tive clareza em minutos sobre o que fazia sentido pra mim."
                </blockquote>
                <div className="mt-4 text-sm text-navy/60">
                  — Profissional de tecnologia
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Copilot Showcase */}
        <CopilotShowcase />

        {/* Entrevista IA Teaser */}
        <section className="py-16 bg-white">
          <div className="container-narrow text-center">
            <Badge className="mb-4 bg-amber/20 text-amber">Pro</Badge>
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-3">
              Treine para entrevistas com IA
            </h2>
            <p className="text-navy/70 mb-6 max-w-xl mx-auto">
              Mock interviews personalizadas com feedback instantâneo. Pratique sem julgamento e evolua a cada sessão.
            </p>
            <Link href="/interview-pro">
              <Button variant="secondary">
                <Mic className="mr-2 w-5 h-5" />
                Saber mais
              </Button>
            </Link>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-3">
                Planos simples
              </h2>
              <p className="text-navy/70">
                Comece grátis. Faça upgrade quando precisar.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-navy mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-navy">R$ 0</span>
                  <span className="text-navy/60">/mês</span>
                </div>
                <ul className="space-y-2 text-sm text-navy/70 mb-6">
                  <li>✓ 3 análises por mês</li>
                  <li>✓ 5 vagas para acompanhar</li>
                  <li>✓ 5 perguntas/dia no Copilot</li>
                  <li>✓ 1 entrevista simulada grátis</li>
                </ul>
                <Link href="/comecar">
                  <Button variant="secondary" className="w-full">Começar grátis</Button>
                </Link>
              </Card>
              <Card className="p-4 sm:p-6 border-amber border-2 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-navy">
                  Recomendado
                </Badge>
                <h3 className="text-lg font-semibold text-navy mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-navy">R$ 19</span>
                  <span className="text-navy/60">/mês</span>
                </div>
                <ul className="space-y-2 text-sm text-navy/70 mb-6">
                  <li>✓ Tudo ilimitado</li>
                  <li>✓ Entrevistas ilimitadas com IA</li>
                  <li>✓ Career Coach IA</li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full">Ver detalhes</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-navy text-sand">
          <div className="container-narrow text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
              Pronto para ter mais clareza?
            </h2>
            <p className="text-sand/70 mb-8 max-w-xl mx-auto">
              Comece agora e receba sua primeira análise de carreira em menos de 2 minutos. Sem precisar criar conta.
            </p>
            <Link href="/comecar">
              <Button size="lg" className="bg-amber hover:bg-amber/90 text-navy">
                Começar agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone/30 py-8">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-navy" />
            </div>
            <span className="text-sm text-navy/70">GoHire Copilot</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-navy/60">
            <Link href="/pricing" className="hover:text-navy transition-colors">
              Preços
            </Link>
            <Link href="/privacidade" className="hover:text-navy transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-navy transition-colors">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
