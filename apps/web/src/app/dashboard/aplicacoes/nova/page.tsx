'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, Button } from '@ui/components'
import { ArrowLeft, Crown, MessageSquare, FileText } from 'lucide-react'
import { checkApplicationAccess } from '../actions'
import { ChatFlow } from './chat-flow'
import { FormFlow } from './form-flow'

export default function NovaAplicacaoPage() {
  const [mode, setMode] = useState<'chat' | 'form'>('chat')
  const [limitReached, setLimitReached] = useState(false)
  const [accessInfo, setAccessInfo] = useState<{ current: number; limit: number } | null>(null)

  useEffect(() => {
    checkApplicationAccess().then((access) => {
      if (access && !access.allowed) {
        setLimitReached(true)
        setAccessInfo({ current: access.current, limit: access.limit })
      }
    })
  }, [])

  if (limitReached) {
    return (
      <div className="container-narrow py-8 sm:py-12">
        <Link 
          href="/dashboard/aplicacoes" 
          className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </Link>

        <Card className="p-4 sm:p-6 md:p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Limite de vagas atingido</h2>
          <p className="text-navy/70 mb-6">
            Você está usando {accessInfo?.current || 5} de {accessInfo?.limit || 5} vagas do plano Free.
            Faça upgrade para acompanhar vagas ilimitadas.
          </p>
          <Link href="/dashboard/plano">
            <Button size="lg" className="w-full">
              Fazer upgrade - R$ 19/mês
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Back link */}
      <Link 
        href="/dashboard/aplicacoes" 
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para lista
      </Link>

      <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-6">
        Nova Candidatura
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone/20 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode('chat')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === 'chat'
              ? 'bg-white text-navy shadow-sm'
              : 'text-navy/60 hover:text-navy'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setMode('form')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === 'form'
              ? 'bg-white text-navy shadow-sm'
              : 'text-navy/60 hover:text-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          Formulário
        </button>
      </div>

      <Card className="p-4 sm:p-6">
        {mode === 'chat' ? <ChatFlow /> : <FormFlow />}
      </Card>
    </div>
  )
}
