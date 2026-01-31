import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/subscription/check-access'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let currentPlan: 'free' | 'pro' | null = null
  if (user) {
    const profile = await getUserProfile(user.id)
    currentPlan = profile?.plan || 'free'
  }

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Para quem está começando a explorar',
      features: [
        { name: '3 insights por mês', included: true },
        { name: '5 vagas para acompanhar', included: true },
        { name: '5 perguntas/dia no Copilot', included: true },
        { name: '1 entrevista simulada (trial)', included: true },
        { name: 'Entrevistas ilimitadas', included: false },
        { name: 'Career Coach IA', included: false },
      ],
      cta: currentPlan === 'free' ? 'Plano atual' : user ? 'Seu plano' : 'Criar conta',
      href: user ? '/dashboard' : '/auth',
      current: currentPlan === 'free',
    },
    {
      name: 'Pro',
      price: 'R$ 19',
      period: '/mês',
      description: 'Para quem leva a carreira a sério',
      features: [
        { name: 'Insights ilimitados', included: true },
        { name: 'Vagas ilimitadas', included: true },
        { name: 'Copilot ilimitado', included: true },
        { name: 'Entrevistas ilimitadas', included: true },
        { name: 'Career Coach IA', included: true },
      ],
      cta: currentPlan === 'pro' ? 'Você já é Pro!' : 'Fazer upgrade',
      href: currentPlan === 'pro' ? '/dashboard' : '/dashboard/plano',
      current: currentPlan === 'pro',
      highlighted: true,
    },
  ]

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
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 py-16 sm:py-24">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-navy mb-4">
              Planos simples, sem surpresas
            </h1>
            <p className="text-lg text-navy/70 max-w-2xl mx-auto">
              Comece gratuitamente e faça upgrade quando precisar de mais poder para sua carreira.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 sm:p-8 relative ${
                  plan.highlighted
                    ? 'border-amber border-2 shadow-lg'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-navy">
                    Mais popular
                  </Badge>
                )}
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-navy mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-navy">{plan.price}</span>
                    <span className="text-navy/60">{plan.period}</span>
                  </div>
                  <p className="text-navy/70 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-teal flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-navy' : 'text-navy/50'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    size="lg"
                    className="w-full"
                    variant={plan.current ? 'ghost' : plan.highlighted ? 'primary' : 'secondary'}
                    disabled={plan.current}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-navy/60 text-sm">
              Pagamento seguro via Stripe. Cancele quando quiser.
            </p>
          </div>
        </div>
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
              Início
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
