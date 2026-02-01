'use client'

import Link from 'next/link'
import { Card, Button } from '@ui/components'
import { MessageSquare, X, Check, User } from 'lucide-react'
import { useFocusTrap } from '@/hooks/use-focus-trap'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const containerRef = useFocusTrap(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-navy/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <Card 
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        className="relative z-10 w-full max-w-md p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-navy/40 hover:text-navy transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-teal" aria-hidden="true" />
          </div>
          
          <h2 id="signup-modal-title" className="text-xl font-semibold text-navy mb-2">
            Quer conversar sobre esta análise?
          </h2>
          
          <p className="text-navy/70 mb-6">
            Crie uma conta gratuita para:
          </p>

          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal flex-shrink-0" aria-hidden="true" />
              <span className="text-navy">Salvar esta análise</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal flex-shrink-0" aria-hidden="true" />
              <span className="text-navy">Conversar com o Copilot sobre sua situação</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal flex-shrink-0" aria-hidden="true" />
              <span className="text-navy">Acompanhar suas candidaturas</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal flex-shrink-0" aria-hidden="true" />
              <span className="text-navy">Receber mais análises personalizadas</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3">
            <Link href="/auth">
              <Button size="lg" className="w-full">
                <User className="mr-2 w-5 h-5" />
                Criar conta gratuita
              </Button>
            </Link>
            <Button variant="ghost" onClick={onClose}>
              Agora nao
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
