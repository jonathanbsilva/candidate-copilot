/**
 * Pages to Audit
 *
 * Organized by authentication requirement.
 * Dynamic routes ([id]) will try to fetch real IDs from the page.
 */

export interface PageToAudit {
  path: string
  name: string
  requiresAuth: boolean
  // For dynamic routes, we'll try to find a real ID
  isDynamic?: boolean
  // Skip if no data available (for dynamic routes)
  skipIfNoData?: boolean
}

// Public pages - no authentication required
export const publicPages: PageToAudit[] = [
  { path: '/', name: 'Landing Page', requiresAuth: false },
  { path: '/auth', name: 'Auth', requiresAuth: false },
  { path: '/comecar', name: 'Comecar', requiresAuth: false },
  { path: '/insight', name: 'Insight Public', requiresAuth: false },
  { path: '/pricing', name: 'Pricing', requiresAuth: false },
  { path: '/interview-pro', name: 'Entrevista IA Landing', requiresAuth: false },
  { path: '/termos', name: 'Termos', requiresAuth: false },
  { path: '/privacidade', name: 'Privacidade', requiresAuth: false },
]

// Dashboard pages - require authentication
export const dashboardPages: PageToAudit[] = [
  { path: '/dashboard', name: 'Dashboard Home', requiresAuth: true },
  { path: '/dashboard/aplicacoes', name: 'Aplicacoes List', requiresAuth: true },
  { path: '/dashboard/aplicacoes/nova', name: 'Nova Aplicacao', requiresAuth: true },
  {
    path: '/dashboard/aplicacoes/:id',
    name: 'Aplicacao Detail',
    requiresAuth: true,
    isDynamic: true,
    skipIfNoData: true,
  },
  { path: '/dashboard/insights', name: 'Insights List', requiresAuth: true },
  {
    path: '/dashboard/insights/:id',
    name: 'Insight Detail',
    requiresAuth: true,
    isDynamic: true,
    skipIfNoData: true,
  },
  { path: '/dashboard/interview-pro', name: 'Entrevista IA', requiresAuth: true },
  { path: '/dashboard/interview-pro/iniciar', name: 'Entrevista IA Iniciar', requiresAuth: true },
  { path: '/dashboard/interview-pro/historico', name: 'Entrevista IA Histórico', requiresAuth: true },
  {
    path: '/dashboard/interview-pro/sessao/:id',
    name: 'Entrevista IA Sessão',
    requiresAuth: true,
    isDynamic: true,
    skipIfNoData: true,
  },
  {
    path: '/dashboard/interview-pro/resultado/:id',
    name: 'Entrevista IA Resultado',
    requiresAuth: true,
    isDynamic: true,
    skipIfNoData: true,
  },
  { path: '/dashboard/metricas', name: 'Metricas', requiresAuth: true },
  { path: '/dashboard/plano', name: 'Plano', requiresAuth: true },
  { path: '/dashboard/configuracoes', name: 'Configuracoes', requiresAuth: true },
]

// All pages combined
export const allPages: PageToAudit[] = [...publicPages, ...dashboardPages]

// Helper to get static pages only (no dynamic routes)
export const staticPages: PageToAudit[] = allPages.filter((p) => !p.isDynamic)
