'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Input } from '@ui/components'
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function AuthContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const errorFromUrl = searchParams.get('error')
  const errorMessage = searchParams.get('message')
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (code: string | null, message: string | null): string | null => {
    if (!code) return null
    
    const errorMessages: Record<string, string> = {
      'auth_failed': 'Link expirado ou inválido. Solicite um novo link.',
      'access_denied': 'Acesso negado. Tente novamente.',
      'otp_expired': 'O link expirou. Solicite um novo link de acesso.',
    }
    
    return errorMessages[code] || message || 'Ocorreu um erro na autenticação. Tente novamente.'
  }
  
  const urlErrorMessage = getErrorMessage(errorFromUrl, errorMessage)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal" />
          </div>
          <h1 className="text-2xl font-semibold text-navy mb-2">
            Verifique seu email
          </h1>
          <p className="text-navy/70 mb-6">
            Enviamos um link de acesso para <strong>{email}</strong>. 
            Clique no link para entrar na sua conta.
          </p>
          <p className="text-sm text-navy/50">
            Nao recebeu? Verifique sua caixa de spam ou{' '}
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-teal hover:underline"
            >
              tente novamente
            </button>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
        </div>
      </header>

      <main className="container-narrow py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-navy/60 hover:text-navy mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para inicio
          </Link>

          <Card variant="elevated" className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-navy mb-2">
                Entre na sua conta
              </h1>
              <p className="text-navy/70">
                Ou crie uma conta gratuita para comecar
              </p>
            </div>

            {/* Google OAuth Button - hidden for now, enable when ready */}
            {/* <Button
              type="button"
              variant="secondary"
              className="w-full mb-4"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone/40" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-navy/50">ou</span>
              </div>
            </div> */}

            {/* Error from URL */}
            {urlErrorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-sm text-red-700">{urlErrorMessage}</p>
              </div>
            )}

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                <Mail className="w-5 h-5 mr-2" />
                Enviar link de acesso
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-navy/50">
              Ao continuar, você concorda com nossos{' '}
              <Link href="/termos" target="_blank" className="text-teal hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" target="_blank" className="text-teal hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-sand flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-stone/30 rounded-full mx-auto mb-4" />
        <div className="h-6 w-48 bg-stone/30 rounded mx-auto" />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  )
}
