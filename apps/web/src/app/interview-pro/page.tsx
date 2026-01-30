import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge, Card, Button } from '@ui/components'
import { Sparkles, MessageSquare, BarChart3, TrendingUp, Phone, Mic, ArrowRight } from 'lucide-react'
import { WaitlistForm } from './waitlist-form'
import { createClient } from '@/lib/supabase/server'

export default async function InterviewProPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect logged-in users to dashboard version
  if (user) {
    redirect('/dashboard/interview-pro')
  }

  // Landing page for non-logged-in users
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
          <Link href="/auth">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container-narrow text-center">
            <Badge className="mb-4 bg-teal/20 text-teal">1 entrevista gratis</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight tracking-tight">
              Treine para entrevistas com IA
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-navy/70 max-w-2xl mx-auto">
              Pratique por texto ou simule uma ligacao real. Feedback instantaneo, sem julgamento. Sua primeira entrevista e gratis!
            </p>
            <div className="mt-8">
              <Link href="/auth">
                <Button size="lg">
                  Fazer minha entrevista gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mode Preview */}
        <section className="py-8 bg-white">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold text-navy text-center mb-8">
              Escolha seu modo de treino
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Text Mode - Available */}
              <Card variant="elevated" className="p-6 border-teal/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-teal/20 text-teal">Disponivel</Badge>
                    <h3 className="text-xl font-semibold text-navy">
                      Modo Texto
                    </h3>
                  </div>
                </div>
                <p className="text-navy/70 mb-6">
                  Responda perguntas digitando. Ideal para quem quer pensar com calma e estruturar bem as respostas.
                </p>
                <ul className="space-y-2 text-sm text-navy/70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                    3 perguntas por sessao (~5 min)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                    Mix comportamental + tecnico
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal rounded-full" />
                    Feedback detalhado no final
                  </li>
                </ul>
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
                      Modo Audio
                    </h3>
                  </div>
                </div>
                <p className="text-navy/70 mb-6">
                  Simule uma ligacao real com IA. Treine sua comunicacao verbal e tempo de resposta.
                </p>
                <ul className="space-y-2 text-sm text-navy/70">
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
                    Gravacao para revisao
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
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

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="container-narrow text-center">
            <Badge className="mb-4 bg-teal/20 text-teal">1 entrevista gratis</Badge>
            <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-3">
              Pronto para treinar?
            </h2>
            <p className="text-navy/70 mb-8 max-w-xl mx-auto">
              Crie uma conta gratuita e experimente o Interview Pro. Sua primeira entrevista e por nossa conta!
            </p>
            <Link href="/auth">
              <Button size="lg">
                Comecar minha entrevista gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Waitlist for Audio Mode */}
        <section className="py-16">
          <div className="container-narrow text-center">
            <h2 className="text-xl font-semibold text-navy mb-3">
              Quer ser avisado quando o modo audio estiver pronto?
            </h2>
            <p className="text-navy/70 mb-6">
              Deixe seu email e avisamos.
            </p>
            <WaitlistForm source="landing-audio" />
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
