'use client'

import { useEffect, useState } from 'react'
import { Card } from '@ui/components'
import { Phone, PhoneOff, MicOff, Mic } from 'lucide-react'

type CallStatus = 'connecting' | 'listening' | 'thinking' | 'responding'

const statusLabels: Record<CallStatus, string> = {
  connecting: 'Conectando...',
  listening: 'Ouvindo voce...',
  thinking: 'Pensando...',
  responding: 'Respondendo...',
}

export function AudioModePreview() {
  const [status, setStatus] = useState<CallStatus>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(true)

  // Cycle through statuses for demo effect
  useEffect(() => {
    if (!isActive) return

    const statusCycle: CallStatus[] = ['connecting', 'listening', 'thinking', 'responding', 'listening']
    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statusCycle.length
      setStatus(statusCycle[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive])

  // Timer effect
  useEffect(() => {
    if (!isActive || status === 'connecting') return

    const interval = setInterval(() => {
      setTimer((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setIsActive(false)
    setStatus('connecting')
    setTimer(0)
    // Restart after a moment
    setTimeout(() => {
      setIsActive(true)
    }, 2000)
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Call Header */}
      <div className="bg-navy text-sand p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="text-sm text-sand/70">Interview Pro</p>
              <p className="font-semibold">Modo Ligacao</p>
            </div>
          </div>
          {status !== 'connecting' && (
            <div className="text-right">
              <p className="text-2xl font-mono font-semibold">{formatTime(timer)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Call Interface */}
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center bg-gradient-to-b from-stone/5 to-stone/10">
        {/* AI Avatar with Audio Waves */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 rounded-full bg-teal/20 flex items-center justify-center transition-all duration-300 ${
            status === 'responding' ? 'scale-110 bg-teal/30' : ''
          }`}>
            <div className="w-20 h-20 rounded-full bg-teal/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center">
                <span className="text-2xl font-bold text-white">IA</span>
              </div>
            </div>
          </div>
          
          {/* Audio Waves Animation */}
          {(status === 'listening' || status === 'responding') && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-end gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1 bg-teal rounded-full transition-all duration-150 ${
                    status === 'responding' ? 'animate-wave' : 'animate-wave-slow'
                  }`}
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Interviewer Name */}
        <h3 className="text-xl font-semibold text-navy mb-1">
          Entrevistador IA
        </h3>
        
        {/* Status */}
        <p className={`text-sm font-medium mb-8 transition-colors duration-300 ${
          status === 'connecting' ? 'text-navy/50' :
          status === 'listening' ? 'text-amber' :
          status === 'thinking' ? 'text-navy/70' :
          'text-teal'
        }`}>
          {statusLabels[status]}
        </p>

        {/* Call Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-stone/20 text-navy hover:bg-stone/30'
            }`}
            aria-label={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Encerrar chamada"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Current Question Indicator */}
      <div className="p-4 sm:p-6 border-t border-stone/30 bg-white">
        <p className="text-xs text-navy/50 uppercase tracking-wide mb-2">Pergunta atual</p>
        <p className="text-navy text-sm">
          {status === 'connecting' 
            ? 'Aguardando conexao...'
            : '"Conte-me sobre um projeto onde voce teve que priorizar features com recursos limitados."'
          }
        </p>
      </div>

      {/* CSS for wave animation */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        @keyframes wave-slow {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
        .animate-wave {
          animation: wave 0.5s ease-in-out infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 0.8s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}
