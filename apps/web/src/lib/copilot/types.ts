export interface UserContext {
  // Resumo do usuario
  profile: {
    totalApplications: number
    activeSince: string
    lastActivity: string
  }
  
  // Metricas
  metrics: {
    taxaConversao: number
    processosAtivos: number
    aguardandoResposta: number
    ofertas: number
    rejeicoes: number
  }
  
  // Aplicacoes recentes (ultimas 10)
  recentApplications: {
    company: string
    title: string
    status: string
    appliedAt: string
    daysSinceApplied: number
  }[]
  
  // Aplicacoes aguardando resposta
  pendingApplications: {
    company: string
    title: string
    daysSinceApplied: number
  }[]
  
  // Historico de insights (todos os insights gerados)
  insights: {
    id: string
    recommendation: string
    why: string[]
    risks: string[]
    nextSteps: string[]
    objetivo: string
    createdAt: string
  }[]
  
  // Resumo do contexto de carreira (do ultimo insight)
  careerContext: {
    cargo: string
    senioridade: string
    area: string
    status: string
    objetivo: string
  } | null
  
  // Historico de entrevistas simuladas (Interview Pro)
  interviewHistory?: InterviewHistoryData | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SuggestedQuestion {
  id: string
  label: string
  category: 'metricas' | 'proximos_passos' | 'insights' | 'analise' | 'interview'
}

// Historico de entrevistas simuladas para contexto do Copilot
export interface InterviewHistoryData {
  totalSessions: number
  averageScore: number | null
  lastScore: number | null
  lastSessionDate: string | null
  recentSessions: {
    cargo: string
    score: number
    completedAt: string
    mainStrengths: string[]
    mainImprovements: string[]
  }[]
}

export interface InsightContextData {
  id: string
  tipo: string
  cargo: string
  area?: string
  recommendation: string
  next_steps: string[]
}

export interface HeroContextData {
  context: string // pending_insight, proposal_received, interview_soon, etc.
  message: string // A dica/mensagem exibida no Hero Card
  company?: string
  title?: string
}

export interface InterviewContextData {
  sessionId: string
  cargo: string
  area?: string
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  tips: string[]
}
