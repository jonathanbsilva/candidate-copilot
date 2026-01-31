'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@ui/components'
import { Cookie, X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'cookie-consent'

type ConsentValue = 'accepted' | 'rejected' | null

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if consent was already given
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentValue
    if (storedConsent) {
      setConsent(storedConsent)
      // Trigger analytics load if accepted
      if (storedConsent === 'accepted') {
        enableAnalytics()
      }
    } else {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const enableAnalytics = () => {
    // Dispatch custom event that analytics providers can listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-accepted'))
  }

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setConsent('accepted')
    setIsVisible(false)
    enableAnalytics()
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setConsent('rejected')
    setIsVisible(false)
  }

  // Don't render if consent already given or banner not visible
  if (consent || !isVisible) {
    return null
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
      role="dialog"
      aria-label="Consentimento de cookies"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-stone/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber/10 rounded-lg flex items-center justify-center">
            <Cookie className="w-5 h-5 text-amber" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-navy mb-2">
              Nós usamos cookies
            </h3>
            <p className="text-sm text-navy/70 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência e analisar o uso do site. 
              Cookies essenciais são necessários para o funcionamento. Cookies analíticos 
              (PostHog, Google Analytics) são carregados apenas com seu consentimento.{' '}
              <Link href="/privacidade" className="text-teal hover:underline">
                Saiba mais
              </Link>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleReject}
              className="order-2 sm:order-1 w-full sm:w-auto"
            >
              Recusar
            </Button>
            <Button 
              size="sm"
              onClick={handleAccept}
              className="order-1 sm:order-2 w-full sm:w-auto"
            >
              Aceitar cookies
            </Button>
          </div>
          
          <button 
            onClick={handleReject}
            className="absolute top-3 right-3 sm:static p-2.5 text-navy/40 hover:text-navy transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to check consent status
export function useCookieConsent(): ConsentValue {
  const [consent, setConsent] = useState<ConsentValue>(null)

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentValue
    setConsent(storedConsent)
  }, [])

  return consent
}

// Helper to check if analytics should be enabled
export function shouldEnableAnalytics(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted'
}
