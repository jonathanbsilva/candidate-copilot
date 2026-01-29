'use client'

import { Card } from '@ui/components'
import { Bot, Mic, CheckCircle } from 'lucide-react'

export function TextModePreview() {
  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Mock Interview Header */}
      <div className="bg-navy text-sand p-4 sm:p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-navy" />
        </div>
        <div>
          <p className="text-sm text-sand/70">Entrevista Simulada</p>
          <p className="font-semibold">Product Manager - Tech</p>
        </div>
      </div>

      {/* Mock Question */}
      <div className="p-4 sm:p-6 border-b border-stone/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Mic className="w-4 h-4 text-teal" />
          </div>
          <div>
            <p className="text-sm text-navy/60 mb-1">Pergunta</p>
            <p className="text-navy font-medium">
              Conte-me sobre um projeto onde voce teve que priorizar features com recursos limitados. Como voce abordou isso?
            </p>
          </div>
        </div>
      </div>

      {/* Mock Response Indicator */}
      <div className="p-4 sm:p-6 border-b border-stone/30 bg-stone/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-amber">Vc</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-navy/60 mb-1">Sua resposta</p>
            <p className="text-navy/70 italic">
              "No meu ultimo projeto, usei o framework RICE para priorizar..."
            </p>
          </div>
        </div>
      </div>

      {/* Mock Feedback */}
      <div className="p-4 sm:p-6 bg-teal/5">
        <p className="text-sm font-semibold text-teal uppercase tracking-wide mb-3">
          Feedback da IA
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <p className="text-navy text-sm">
              <span className="font-medium">Estrutura clara:</span> Voce usou um framework reconhecido (RICE) para organizar sua resposta.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <p className="text-navy text-sm">
              <span className="font-medium">Exemplo concreto:</span> Mencionou uma situacao real com contexto especifico.
            </p>
          </div>
          <div className="flex items-start gap-2 opacity-60">
            <div className="w-5 h-5 border-2 border-amber rounded-full flex-shrink-0 mt-0.5" />
            <p className="text-navy text-sm">
              <span className="font-medium">Pode melhorar:</span> Inclua metricas ou resultados para fortalecer o impacto.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
