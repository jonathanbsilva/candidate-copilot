'use client'

import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@ui/components'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Reportar para Sentry se configurado
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, { 
        extra: { 
          componentStack: errorInfo.componentStack 
        } 
      })
    }
    
    // Log para console em dev
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback padrao
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-navy mb-2">Algo deu errado</h2>
          <p className="text-navy/70 text-center max-w-md mb-6">
            Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
          </p>
          <Button onClick={this.handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
