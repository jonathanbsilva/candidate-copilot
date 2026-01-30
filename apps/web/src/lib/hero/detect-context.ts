import type { Application } from '@/lib/types/application'
import type { HeroContext, UserDataForHero, ContextDetectionResult } from './types'

const DAYS_MS = 24 * 60 * 60 * 1000

function daysSince(dateString: string): number {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / DAYS_MS)
}

/**
 * Detecta o contexto mais relevante para o Hero Card baseado na prioridade:
 * 1. pending_insight - localStorage tem insight pendente
 * 2. proposal_received - App com status "proposta"
 * 3. interview_soon - App com status "entrevista"
 * 4. interview_feedback - Mock interview completada nas ultimas 24h
 * 5. needs_followup - App sem update 7+ dias
 * 6. stale_apps - 3+ apps paradas 14+ dias
 * 7. low_activity - Sem app nova 7+ dias
 * 8. new_user - 0 apps, 0 insights
 * 9. active_summary - Default
 */
export function detectContext(userData: UserDataForHero): ContextDetectionResult {
  const { applications, insights, hasPendingInsight, recentInterviewSession } = userData

  // 1. Insight pendente (prioridade maxima)
  if (hasPendingInsight) {
    return { context: 'pending_insight' }
  }

  // 2. Proposta recebida
  const proposalApp = applications.find(app => app.status === 'proposta')
  if (proposalApp) {
    return { 
      context: 'proposal_received', 
      relevantApp: proposalApp,
      metadata: { company: proposalApp.company, title: proposalApp.title }
    }
  }

  // 3. Entrevista proxima
  const interviewApp = applications.find(app => app.status === 'entrevista')
  if (interviewApp) {
    return { 
      context: 'interview_soon', 
      relevantApp: interviewApp,
      metadata: { company: interviewApp.company, title: interviewApp.title }
    }
  }

  // 4. Mock interview completada recentemente (24h)
  if (recentInterviewSession && recentInterviewSession.completed_at) {
    const hoursSinceCompletion = (Date.now() - new Date(recentInterviewSession.completed_at).getTime()) / (1000 * 60 * 60)
    if (hoursSinceCompletion <= 24) {
      return {
        context: 'interview_feedback',
        interviewSession: recentInterviewSession,
        metadata: {
          sessionId: recentInterviewSession.id,
          cargo: recentInterviewSession.cargo,
          score: recentInterviewSession.overall_score,
          mainTip: recentInterviewSession.feedback?.general_tips?.[0] || null
        }
      }
    }
  }

  // 4. Precisa de follow-up (7+ dias sem update)
  const appsNeedingFollowup = applications.filter(app => {
    const isActive = ['aplicado', 'em_analise'].includes(app.status)
    const daysSinceUpdate = daysSince(app.updated_at)
    return isActive && daysSinceUpdate >= 7
  })
  
  if (appsNeedingFollowup.length > 0) {
    // Pega a mais antiga
    const oldestApp = appsNeedingFollowup.sort((a, b) => 
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    )[0]
    
    return { 
      context: 'needs_followup', 
      relevantApp: oldestApp,
      metadata: { 
        company: oldestApp.company, 
        title: oldestApp.title,
        daysSinceUpdate: daysSince(oldestApp.updated_at)
      }
    }
  }

  // 5. Apps paradas (3+ apps sem movimento 14+ dias)
  const staleApps = applications.filter(app => {
    const isStagnant = ['aplicado', 'em_analise'].includes(app.status)
    const daysSinceUpdate = daysSince(app.updated_at)
    return isStagnant && daysSinceUpdate >= 14
  })

  if (staleApps.length >= 3) {
    return { 
      context: 'stale_apps',
      metadata: { count: staleApps.length }
    }
  }

  // 6. Baixa atividade (sem app nova 7+ dias)
  if (applications.length > 0) {
    const latestApp = applications.reduce((latest, app) => 
      new Date(app.created_at) > new Date(latest.created_at) ? app : latest
    )
    
    if (daysSince(latestApp.created_at) >= 7) {
      return { 
        context: 'low_activity',
        metadata: { daysSinceLastApp: daysSince(latestApp.created_at) }
      }
    }
  }

  // 7. Usuario novo (0 apps E 0 insights)
  if (applications.length === 0 && insights.length === 0) {
    return { context: 'new_user' }
  }

  // 8. Default - resumo ativo
  return { 
    context: 'active_summary',
    metadata: {
      totalApps: applications.length,
      activeApps: applications.filter(a => 
        ['aplicado', 'em_analise', 'entrevista'].includes(a.status)
      ).length
    }
  }
}
