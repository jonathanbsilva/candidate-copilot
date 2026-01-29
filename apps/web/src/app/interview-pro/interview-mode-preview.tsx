'use client'

import { useState } from 'react'
import { MessageSquare, Phone } from 'lucide-react'
import { TextModePreview } from './text-mode-preview'
import { AudioModePreview } from './audio-mode-preview'

type Mode = 'text' | 'audio'

export function InterviewModePreview() {
  const [mode, setMode] = useState<Mode>('text')

  return (
    <div>
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            mode === 'text'
              ? 'bg-navy text-sand shadow-md'
              : 'bg-stone/20 text-navy hover:bg-stone/30'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Texto
        </button>
        <button
          onClick={() => setMode('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            mode === 'audio'
              ? 'bg-navy text-sand shadow-md'
              : 'bg-stone/20 text-navy hover:bg-stone/30'
          }`}
        >
          <Phone className="w-4 h-4" />
          Ligacao
        </button>
      </div>

      {/* Mode Description */}
      <p className="text-center text-sm text-navy/60 mb-6">
        {mode === 'text' 
          ? 'Responda digitando, como em um chat. Ideal para treinar estrutura e conteudo.'
          : 'Simule uma ligacao real. A IA fala, voce responde por voz.'
        }
      </p>

      {/* Preview */}
      <div className="transition-all duration-300">
        {mode === 'text' ? <TextModePreview /> : <AudioModePreview />}
      </div>
    </div>
  )
}
