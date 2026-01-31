'use client'

import { useState } from 'react'
import { Button, Card } from '@ui/components'
import { CreditCard, Settings, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        alert('Erro ao iniciar checkout. Tente novamente.')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size="lg" onClick={handleCheckout} isLoading={isLoading}>
      <CreditCard className="w-4 h-4 mr-2" />
      Fazer upgrade
    </Button>
  )
}

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No portal URL returned')
        alert('Erro ao abrir portal. Tente novamente.')
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Erro ao abrir portal. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleManage} isLoading={isLoading}>
      <Settings className="w-4 h-4 mr-2" />
      Gerenciar pagamento
    </Button>
  )
}

// Coupon types
type ValidatedCoupon = {
  code: string
  discount_percent: number
  duration_months: number
  original_price: number
  discounted_price: number
}

// Coupon Input Component with two-step flow
export function CouponInput() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validatedCoupon, setValidatedCoupon] = useState<ValidatedCoupon | null>(null)

  const handleValidateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsValidating(true)
    setError(null)
    setValidatedCoupon(null)

    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await response.json()

      if (data.valid) {
        setValidatedCoupon({
          code: data.code,
          discount_percent: data.discount_percent,
          duration_months: data.duration_months,
          original_price: data.original_price,
          discounted_price: data.discounted_price,
        })
      } else {
        setError(data.error || 'Cupom invalido')
      }
    } catch (err) {
      console.error('Error validating coupon:', err)
      setError('Erro ao validar cupom. Tente novamente.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!validatedCoupon) return

    setIsApplying(true)
    setError(null)

    try {
      const response = await fetch('/api/coupon/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: validatedCoupon.code }),
      })
      const data = await response.json()

      if (data.success) {
        router.refresh()
      } else {
        setError(data.error || 'Erro ao aplicar cupom')
      }
    } catch (err) {
      console.error('Error applying coupon:', err)
      setError('Erro ao aplicar cupom. Tente novamente.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleClearCoupon = () => {
    setValidatedCoupon(null)
    setCode('')
    setError(null)
  }

  // Show coupon preview after validation
  if (validatedCoupon) {
    return (
      <div className="mt-6 pt-6 border-t border-stone/20">
        <div className="bg-teal/10 border border-teal/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-teal">Cupom aplicado:</span>
              <span className="bg-teal/20 text-teal text-xs font-bold px-2 py-1 rounded">
                {validatedCoupon.code}
              </span>
            </div>
            <button
              onClick={handleClearCoupon}
              className="text-navy/50 hover:text-navy text-sm"
            >
              Remover
            </button>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-navy/50 line-through text-lg">
              R$ {validatedCoupon.original_price}
            </span>
            <span className="text-3xl font-bold text-navy">
              {validatedCoupon.discounted_price === 0 
                ? 'Gratis' 
                : `R$ ${validatedCoupon.discounted_price.toFixed(0)}`}
            </span>
            <span className="text-navy/60">/mes</span>
          </div>

          <p className="text-sm text-navy/60 mb-4">
            {validatedCoupon.discount_percent}% de desconto por {validatedCoupon.duration_months}{' '}
            {validatedCoupon.duration_months === 1 ? 'mês' : 'meses'}
          </p>

          <Button 
            size="lg" 
            className="w-full"
            onClick={handleApplyCoupon}
            isLoading={isApplying}
          >
            {validatedCoupon.discounted_price === 0 
              ? 'Ativar Pro grátis'
              : 'Fazer upgrade'}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>
      </div>
    )
  }

  // Default: show coupon input form
  return (
    <div className="mt-6 pt-6 border-t border-stone/20">
      <p className="text-sm font-medium text-navy mb-3">Tem um cupom?</p>
      <form onSubmit={handleValidateCoupon} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODIGO"
          disabled={isValidating}
          className="
            flex-1 h-10 px-3 rounded-lg border border-stone
            text-navy placeholder:text-navy/40 uppercase
            focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-1
            disabled:opacity-50
          "
        />
        <Button 
          type="submit" 
          variant="secondary"
          disabled={isValidating || !code.trim()}
          isLoading={isValidating}
        >
          Aplicar
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}

interface CancelSubscriptionProps {
  hasStripeSubscription: boolean
  currentPeriodEnd: string | null
}

export function CancelSubscriptionSection({ hasStripeSubscription, currentPeriodEnd }: CancelSubscriptionProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cancelType, setCancelType] = useState<'end' | 'immediate' | null>(null)

  const handleCancel = async (immediate: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate }),
      })
      const data = await response.json()
      
      if (data.success) {
        router.refresh()
        setShowConfirm(false)
      } else {
        alert(data.error || 'Erro ao cancelar assinatura')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-navy">Cancelar assinatura</h4>
              <p className="text-sm text-navy/70 mt-1">
                Escolha como deseja cancelar:
              </p>
            </div>
            <button 
              onClick={() => setShowConfirm(false)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4 text-navy/50" />
            </button>
          </div>

          <div className="space-y-3">
            {hasStripeSubscription && currentPeriodEnd && (
              <button
                onClick={() => { setCancelType('end'); handleCancel(false); }}
                disabled={isLoading}
                className="w-full p-3 text-left border border-stone/30 rounded-lg hover:border-amber hover:bg-amber/5 transition-colors disabled:opacity-50"
              >
                <p className="font-medium text-navy">Cancelar no fim do periodo</p>
                <p className="text-sm text-navy/60 mt-1">
                  Continue usando o Pro ate {currentPeriodEnd}, depois muda para Free.
                </p>
              </button>
            )}

            <button
              onClick={() => { setCancelType('immediate'); handleCancel(true); }}
              disabled={isLoading}
              className="w-full p-3 text-left border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <p className="font-medium text-red-700">Cancelar imediatamente</p>
              <p className="text-sm text-red-600/70 mt-1">
                Perder acesso ao Pro agora e mudar para Free.
              </p>
            </button>
          </div>

          {isLoading && (
            <p className="text-sm text-navy/60 mt-3 text-center">
              {cancelType === 'end' ? 'Agendando cancelamento...' : 'Cancelando...'}
            </p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-navy/50 hover:text-red-600 transition-colors"
    >
      Cancelar assinatura
    </button>
  )
}
