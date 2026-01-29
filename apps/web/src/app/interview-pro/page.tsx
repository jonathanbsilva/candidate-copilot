import Link from 'next/link'
import { Badge, Card } from '@ui/components'
import { Sparkles, MessageSquare, BarChart3, TrendingUp, Phone } from 'lucide-react'
import { WaitlistForm } from './waitlist-form'
import { InterviewModePreview } from './interview-mode-preview'

export default function InterviewProPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container-narrow text-center">
            <Badge className="mb-4 bg-amber/20 text-amber">Em breve</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight tracking-tight">
              Treine para entrevistas com IA
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-navy/70 max-w-2xl mx-auto">
              Pratique por texto ou simule uma ligacao real. Feedback instantaneo, sem julgamento.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy text-center mb-12">
              O que voce vai ter acesso
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Perguntas reais
                </h3>
                <p className="text-navy/70 text-sm">
                  Banco de perguntas baseado em vagas e areas reais do mercado brasileiro.
                </p>
              </Card>

              <Card className="text-center p-6 border-amber/30 bg-amber/5">
                <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Texto ou Ligacao
                </h3>
                <p className="text-navy/70 text-sm">
                  Prefere digitar? Ou quer treinar como numa ligacao real? Voce escolhe.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Feedback instantaneo
                </h3>
                <p className="text-navy/70 text-sm">
                  Receba analise detalhada de conteudo, tom e estrutura da sua resposta.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-navy" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Evolucao visivel
                </h3>
                <p className="text-navy/70 text-sm">
                  Acompanhe seu progresso e veja sua confianca crescer entrevista apos entrevista.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16">
          <div className="container-narrow">
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy text-center mb-8">
              Como vai funcionar
            </h2>
            <InterviewModePreview />
          </div>
        </section>

        {/* Waitlist Section */}
        <section className="py-16 bg-white">
          <div className="container-narrow text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-3">
              Seja o primeiro a saber
            </h2>
            <p className="text-navy/70 mb-8 max-w-xl mx-auto">
              Estamos preparando algo especial. Deixe seu email e avisamos quando estiver pronto.
            </p>
            <WaitlistForm source="direct" />
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
            <Link href="/" className="hover:text-navy transition-colors">
              Inicio
            </Link>
            <Link href="#" className="hover:text-navy transition-colors">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-navy transition-colors">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
