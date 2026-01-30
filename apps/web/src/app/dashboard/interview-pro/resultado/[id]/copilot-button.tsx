'use client'

import { Button } from '@ui/components'
import { MessageSquare } from 'lucide-react'
import { useCopilotDrawer, type InterviewContext } from '@/hooks/use-copilot-drawer'

interface CopilotButtonProps {
  session: {
    id: string
    cargo: string
    area: string | null
    overall_score: number | null
    feedback: {
      summary?: string
      per_question?: Array<{
        strengths: string[]
        improvements: string[]
      }>
      general_tips?: string[]
    } | null
  }
}

export function CopilotButton({ session }: CopilotButtonProps) {
  const { openWithInterviewContext } = useCopilotDrawer()

  const handleClick = () => {
    // Build interview context from session data
    const strengths: string[] = []
    const improvements: string[] = []
    
    if (session.feedback?.per_question) {
      session.feedback.per_question.forEach(pq => {
        if (pq.strengths) strengths.push(...pq.strengths)
        if (pq.improvements) improvements.push(...pq.improvements)
      })
    }

    const context: InterviewContext = {
      sessionId: session.id,
      cargo: session.cargo,
      area: session.area || undefined,
      score: session.overall_score || 0,
      summary: session.feedback?.summary || '',
      strengths: strengths.slice(0, 5), // Limit to top 5
      improvements: improvements.slice(0, 5), // Limit to top 5
      tips: session.feedback?.general_tips || [],
    }

    openWithInterviewContext(context)
  }

  return (
    <Button variant="secondary" onClick={handleClick}>
      <MessageSquare className="w-5 h-5 mr-2" />
      Explorar com Copilot
    </Button>
  )
}
