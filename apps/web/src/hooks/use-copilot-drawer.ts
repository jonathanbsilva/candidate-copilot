'use client'

import { create } from 'zustand'

export type InsightContext = {
  id: string
  tipo: string
  cargo: string
  area?: string
  senioridade?: string
  status?: string
  objetivo?: string
  // V1 fields
  recommendation?: string
  next_steps?: string[]
  // V1.1 diagnostic fields
  diagnosis?: string
  pattern?: string
  risk?: string
  nextStep?: string
  typeLabel?: string
  // V1.1 contextual data
  urgencia?: number
  tempoSituacao?: string
  decisionBlocker?: string
  interviewBottleneck?: string
  maxStage?: string
  leverageSignals?: string
  pivotType?: string
  transferableStrengths?: string
  avoidedDecision?: string
}

export type HeroContext = {
  type: 'hero'
  context: string // pending_insight, proposal_received, etc.
  message: string
  company?: string
  title?: string
}

export type InterviewContext = {
  sessionId: string
  cargo: string
  area?: string
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  tips: string[]
}

export type BenchmarkContext = {
  userTaxa: number
  mediaTaxa: number
  percentil: number
  totalUsuarios: number
  diff: number
  isAbove: boolean
}

// Contexto de aplicação/vaga para CTAs como proposta, entrevista, etc.
export type ApplicationContext = {
  type: 'application'
  id: string
  company: string
  title: string
  status: string
  salaryRange?: string
  notes?: string
  jobDescription?: string
  location?: string
  url?: string
}

type CopilotDrawerStore = {
  isOpen: boolean
  insightContext: InsightContext | null
  heroContext: HeroContext | null
  interviewContext: InterviewContext | null
  benchmarkContext: BenchmarkContext | null
  applicationContext: ApplicationContext | null
  pendingQuestion: string | null
  open: () => void
  close: () => void
  openWithContext: (context: InsightContext) => void
  openWithHeroContext: (context: HeroContext) => void
  openWithInterviewContext: (context: InterviewContext) => void
  openWithBenchmarkContext: (context: BenchmarkContext) => void
  openWithApplicationContext: (context: ApplicationContext) => void
  openWithPendingQuestion: (question: string, heroContext?: HeroContext) => void
  clearPendingQuestion: () => void
  clearContext: () => void
}

export const useCopilotDrawer = create<CopilotDrawerStore>((set) => ({
  isOpen: false,
  insightContext: null,
  heroContext: null,
  interviewContext: null,
  benchmarkContext: null,
  applicationContext: null,
  pendingQuestion: null,
  open: () => set({ isOpen: true, insightContext: null, heroContext: null, interviewContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
  close: () => set({ isOpen: false, insightContext: null, heroContext: null, interviewContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
  openWithContext: (context) => set({ isOpen: true, insightContext: context, heroContext: null, interviewContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
  openWithHeroContext: (context) => set({ isOpen: true, heroContext: context, insightContext: null, interviewContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
  openWithInterviewContext: (context) => set({ isOpen: true, interviewContext: context, insightContext: null, heroContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
  openWithBenchmarkContext: (context) => set({ isOpen: true, benchmarkContext: context, insightContext: null, heroContext: null, interviewContext: null, applicationContext: null, pendingQuestion: null }),
  openWithApplicationContext: (context) => set({ isOpen: true, applicationContext: context, insightContext: null, heroContext: null, interviewContext: null, benchmarkContext: null, pendingQuestion: null }),
  openWithPendingQuestion: (question, heroCtx) => set({
    isOpen: true,
    pendingQuestion: question.trim() || null,
    heroContext: heroCtx || null,
    insightContext: null,
    interviewContext: null,
    benchmarkContext: null,
    applicationContext: null,
  }),
  clearPendingQuestion: () => set({ pendingQuestion: null }),
  clearContext: () => set({ insightContext: null, heroContext: null, interviewContext: null, benchmarkContext: null, applicationContext: null, pendingQuestion: null }),
}))
