'use client'

import { create } from 'zustand'

export type InsightContext = {
  id: string
  tipo: string
  cargo: string
  area?: string
  recommendation: string
  next_steps: string[]
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

type CopilotDrawerStore = {
  isOpen: boolean
  insightContext: InsightContext | null
  heroContext: HeroContext | null
  interviewContext: InterviewContext | null
  open: () => void
  close: () => void
  openWithContext: (context: InsightContext) => void
  openWithHeroContext: (context: HeroContext) => void
  openWithInterviewContext: (context: InterviewContext) => void
  clearContext: () => void
}

export const useCopilotDrawer = create<CopilotDrawerStore>((set) => ({
  isOpen: false,
  insightContext: null,
  heroContext: null,
  interviewContext: null,
  open: () => set({ isOpen: true, insightContext: null, heroContext: null, interviewContext: null }),
  close: () => set({ isOpen: false, insightContext: null, heroContext: null, interviewContext: null }),
  openWithContext: (context) => set({ isOpen: true, insightContext: context, heroContext: null, interviewContext: null }),
  openWithHeroContext: (context) => set({ isOpen: true, heroContext: context, insightContext: null, interviewContext: null }),
  openWithInterviewContext: (context) => set({ isOpen: true, interviewContext: context, insightContext: null, heroContext: null }),
  clearContext: () => set({ insightContext: null, heroContext: null, interviewContext: null }),
}))
