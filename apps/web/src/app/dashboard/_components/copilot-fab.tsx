'use client'

import { Sparkles } from 'lucide-react'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'

export function CopilotFAB() {
  const { open } = useCopilotDrawer()

  return (
    <button
      onClick={open}
      className="
        fixed bottom-6 right-6 z-30
        hidden md:flex
        w-14 h-14 items-center justify-center
        rounded-full shadow-lg hover:shadow-xl hover:scale-105
        transition-all duration-200
        group
        bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500
        hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
      "
      aria-label="Abrir Copilot"
    >
      <Sparkles className="w-6 h-6 text-white" />
    </button>
  )
}
