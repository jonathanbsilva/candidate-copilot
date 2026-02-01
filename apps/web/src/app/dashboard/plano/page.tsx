import { redirect } from 'next/navigation'
import { Card, Badge } from '@ui/components'
import { Sparkles, Check, Calendar, TrendingUp, CheckCircle, XCircle, Clock, Gift, Briefcase, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FREE_INSIGHTS_LIMIT, FREE_APPLICATIONS_LIMIT, FREE_COPILOT_DAILY_LIMIT } from '@/lib/subscription/limits'
import { CheckoutButton, ManageSubscriptionButton, CancelSubscriptionSection, CouponInput } from './stripe-buttons'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Reusable usage item component with better mobile layout
function UsageItem({ 
  icon, 
  iconBg, 
  title, 
  description, 
  remaining 
}: { 
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  remaining?: number
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <div>
            <p className="font-medium text-navy text-sm sm:text-base">{title}</p>
            <p className="text-xs sm:text-sm text-navy/60">{description}</p>
          </div>
          {remaining !== undefined && (
            <div className="flex items-baseline gap-1 sm:text-right mt-1 sm:mt-0">
              <span className="text-xl sm:text-2xl font-bold text-navy">
                {remaining}
              </span>
              <span className="text-xs text-navy/60">restantes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function PlanoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Fetch full profile with subscription details
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const applicationsUsed = profile?.applications_used_this_month || 0
  const insightsUsed = profile?.insights_used_this_month || 0
  const copilotUsed = profile?.copilot_messages_today || 0
  const subscriptionStatus = profile?.subscription_status
  const upgradeSource = profile?.upgrade_source
  const hasStripeSubscription = upgradeSource === 'stripe'
  const isWhitelistUpgrade = upgradeSource === 'whitelist'
  const isCouponUpgrade = upgradeSource === 'coupon'
  const couponCode = profile?.coupon_code
  const couponExpiresAt = profile?.coupon_expires_at 
    ? new Date(profile.coupon_expires_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null
  const currentPeriodEnd = profile?.current_period_end 
    ? new Date(profile.current_period_end).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null
  const resetAt = profile?.insights_reset_at 
    ? new Date(profile.insights_reset_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long'
      })
    : null

  // Check for success/cancel from Stripe redirect
  const showSuccess = params.success === 'true'
  const showCanceled = params.canceled === 'true'
  
  // Check if subscription is set to cancel at period end
  const isCanceling = subscriptionStatus === 'canceling'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1 sm:mb-2">Seu plano</h1>
        <p className="text-navy/70 mb-6 sm:mb-8 text-sm sm:text-base">Gerencie sua assinatura e veja seu uso.</p>

        {/* Success/Cancel Messages */}
        {showSuccess && (
          <Card className="mb-6 bg-teal/10 border-teal/30">
            <div className="p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal" />
              <div>
                <p className="font-medium text-navy">Assinatura ativada com sucesso!</p>
                <p className="text-sm text-navy/70">Bem-vindo ao plano Pro. Aproveite todos os recursos.</p>
              </div>
            </div>
          </Card>
        )}

        {showCanceled && (
          <Card className="mb-6 bg-amber/10 border-amber/30">
            <div className="p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-amber" />
              <div>
                <p className="font-medium text-navy">Checkout cancelado</p>
                <p className="text-sm text-navy/70">Você pode tentar novamente quando quiser.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan Card */}
        <Card className="mb-6 overflow-hidden">
          <div className={`p-4 sm:p-6 ${plan === 'pro' ? 'bg-amber/10' : 'bg-stone/10'}`}>
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-navy">
                    Plano {plan === 'pro' ? 'Pro' : 'Free'}
                  </h2>
                  <Badge className={plan === 'pro' ? 'bg-amber text-navy' : 'bg-stone text-navy/70'}>
                    {plan === 'pro' ? 'Ativo' : 'Gratuito'}
                  </Badge>
                </div>
                <p className="text-navy/70 text-sm sm:text-base">
                  {plan === 'pro' 
                    ? 'Acesso completo a todos os recursos.'
                    : 'Acesso básico com limite de insights.'
                  }
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber" />
              </div>
            </div>
          </div>

          {/* Subscription Info (Pro users) */}
          {plan === 'pro' && (
            <div className="p-4 sm:p-6 border-t border-stone/30 bg-white">
              {/* Canceling notice */}
              {isCanceling && currentPeriodEnd && (
                <div className="mb-4 p-3 bg-amber/10 rounded-lg flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy text-sm sm:text-base">Cancelamento agendado</p>
                    <p className="text-xs sm:text-sm text-navy/70">
                      Sua assinatura será cancelada em {currentPeriodEnd}. 
                      Você continua com acesso Pro até lá.
                    </p>
                  </div>
                </div>
              )}

              {/* Coupon info */}
              {isCouponUpgrade && couponExpiresAt && (
                <div className="mb-4 p-3 bg-teal/10 rounded-lg flex items-start gap-3">
                  <Gift className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy text-sm sm:text-base">
                      Cupom aplicado{couponCode && `: ${couponCode}`}
                    </p>
                    <p className="text-xs sm:text-sm text-navy/70">
                      Acesso Pro gratuito até {couponExpiresAt}.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Status info - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-navy/60">Status da assinatura</p>
                  <p className="font-medium text-navy text-sm sm:text-base">
                    {subscriptionStatus === 'active' && 'Ativa'}
                    {subscriptionStatus === 'trialing' && 'Período de teste'}
                    {subscriptionStatus === 'past_due' && 'Pagamento pendente'}
                    {subscriptionStatus === 'canceling' && 'Cancelamento agendado'}
                    {subscriptionStatus === 'canceled' && 'Cancelada'}
                    {!subscriptionStatus && 'Ativa'}
                  </p>
                </div>
                {hasStripeSubscription && currentPeriodEnd && !isCanceling && (
                  <div className="sm:text-right">
                    <p className="text-xs sm:text-sm text-navy/60">Próxima cobrança</p>
                    <p className="font-medium text-navy text-sm sm:text-base">{currentPeriodEnd}</p>
                  </div>
                )}
                {isCouponUpgrade && couponExpiresAt && (
                  <div className="sm:text-right">
                    <p className="text-xs sm:text-sm text-navy/60">Válido até</p>
                    <p className="font-medium text-navy text-sm sm:text-base">{couponExpiresAt}</p>
                  </div>
                )}
              </div>
              
              {/* Action buttons - Stack on mobile */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  {hasStripeSubscription && !isCanceling && (
                    <ManageSubscriptionButton />
                  )}
                  {isWhitelistUpgrade && (
                    <p className="text-sm text-navy/50">Acesso Pro cortesia</p>
                  )}
                  {isCouponUpgrade && (
                    <p className="text-sm text-navy/50">Acesso Pro via cupom</p>
                  )}
                </div>
                
                {!isCanceling && (
                  <CancelSubscriptionSection 
                    hasStripeSubscription={hasStripeSubscription}
                    currentPeriodEnd={currentPeriodEnd}
                  />
                )}
              </div>
            </div>
          )}

          {/* Usage Stats */}
          <div className="p-4 sm:p-6 border-t border-stone/30">
            <h3 className="text-xs sm:text-sm font-semibold text-navy/70 uppercase tracking-wide mb-4">
              Uso este mês
            </h3>
            
            <div className="space-y-4">
              {/* Insights Usage */}
              <UsageItem
                icon={<TrendingUp className="w-5 h-5 text-teal" />}
                iconBg="bg-teal/10"
                title="Análises geradas"
                description={plan === 'pro' ? 'Ilimitado' : `${insightsUsed} de ${FREE_INSIGHTS_LIMIT} usados`}
                remaining={plan === 'free' ? FREE_INSIGHTS_LIMIT - insightsUsed : undefined}
              />

              {/* Applications Usage */}
              <UsageItem
                icon={<Briefcase className="w-5 h-5 text-amber" />}
                iconBg="bg-amber/10"
                title="Vagas cadastradas"
                description={plan === 'pro' ? 'Ilimitado' : `${applicationsUsed} de ${FREE_APPLICATIONS_LIMIT} usadas`}
                remaining={plan === 'free' ? Math.max(0, FREE_APPLICATIONS_LIMIT - applicationsUsed) : undefined}
              />

              {/* Copilot Usage (daily) */}
              <UsageItem
                icon={<MessageCircle className="w-5 h-5 text-purple-600" />}
                iconBg="bg-purple-100"
                title="Copilot (hoje)"
                description={plan === 'pro' ? 'Ilimitado' : `${copilotUsed} de ${FREE_COPILOT_DAILY_LIMIT} mensagens`}
                remaining={plan === 'free' ? Math.max(0, FREE_COPILOT_DAILY_LIMIT - copilotUsed) : undefined}
              />

              {/* Reset Date */}
              {plan === 'free' && resetAt && (
                <div className="flex items-start sm:items-center gap-3 pt-4 border-t border-stone/20">
                  <Calendar className="w-5 h-5 text-navy/40 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-navy/60">
                    Contadores de análises e vagas reiniciam em {resetAt}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Pro Benefits (show to free users) */}
        {plan === 'free' && (
          <Card className="border-amber/30">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-navy mb-4">
                Faça upgrade para o Pro
              </h3>
              <ul className="space-y-2.5 sm:space-y-3 mb-6">
                <li className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-navy text-sm sm:text-base">Análises ilimitadas</span>
                </li>
                <li className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-navy text-sm sm:text-base">Vagas ilimitadas para acompanhar</span>
                </li>
                <li className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-navy text-sm sm:text-base">Copilot ilimitado</span>
                </li>
                <li className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-navy text-sm sm:text-base">Entrevista IA - treino de entrevistas com IA</span>
                </li>
                <li className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-navy text-sm sm:text-base">Career Coach IA personalizado</span>
                </li>
              </ul>
              
              {/* Price + CTA - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-navy">R$ 19</span>
                  <span className="text-navy/60">/mês</span>
                </div>
                <div className="w-full sm:w-auto">
                  <CheckoutButton />
                </div>
              </div>
              
              {/* Coupon Input */}
              <CouponInput />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
