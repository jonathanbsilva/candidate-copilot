import type { Application } from '@/lib/types/application'

export type HeroContext = 
  | 'pending_insight'
  | 'proposal_received'
  | 'interview_soon'
  | 'interview_feedback'  // Mock interview completada recentemente
  | 'needs_followup'
  | 'stale_apps'
  | 'low_activity'
  | 'new_user'
  | 'active_summary'

export type HeroData = {
  context: HeroContext
  title: string
  message: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  metadata?: Record<string, unknown>
}

export type InterviewSessionForHero = {
  id: string
  cargo: string
  area: string | null
  overall_score: number | null
  feedback: {
    summary?: string
    general_tips?: string[]
  } | null
  completed_at: string
}

export type UserDataForHero = {
  applications: Application[]
  insights: Array<{ id: string; created_at: string }>
  hasPendingInsight: boolean
  recentInterviewSession?: InterviewSessionForHero | null
}

export type ContextDetectionResult = {
  context: HeroContext
  relevantApp?: Application
  interviewSession?: InterviewSessionForHero
  metadata?: Record<string, unknown>
}
