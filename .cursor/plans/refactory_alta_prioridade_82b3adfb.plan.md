---
name: Alta Prioridade
overview: Correções de alta prioridade em Performance, Estado, Observabilidade, Qualidade de Código e Acessibilidade que melhoram significativamente a estabilidade e manutenibilidade do projeto.
todos:
  - id: perf-parallel
    content: Paralelizar queries com Promise.all() no dashboard e actions
    status: completed
  - id: perf-suspense
    content: Adicionar Suspense boundaries nas páginas principais
    status: pending
  - id: perf-lazy
    content: Lazy load do CopilotDrawer com dynamic import
    status: pending
  - id: state-duplicate
    content: Corrigir estado duplicado do Copilot (remover prop, usar só store)
    status: pending
  - id: state-revalidate
    content: Adicionar revalidatePath('/dashboard') nas mutations de aplicações
    status: pending
  - id: state-context
    content: Otimizar getUserContext para aceitar cache
    status: pending
  - id: obs-sentry
    content: Instalar e configurar Sentry para error tracking
    status: pending
  - id: obs-logger
    content: Criar lib/logger.ts com logging estruturado
    status: pending
  - id: obs-boundary
    content: Criar ErrorBoundary e usar no dashboard layout
    status: pending
  - id: quality-helper
    content: Criar helper getAuthenticatedUser() e refatorar actions
    status: pending
  - id: quality-errors
    content: Adicionar error handling em operações críticas
    status: pending
  - id: ai-tracking
    content: Criar tabela e helper para tracking de tokens de IA
    status: pending
  - id: a11y-skip
    content: Adicionar skip link no dashboard layout
    status: pending
  - id: a11y-aria
    content: Adicionar aria-label em botões de ícone
    status: pending
  - id: a11y-alert
    content: Adicionar role="alert" em mensagens de erro
    status: pending
isProject: false
---

# Plano: Correções de Alta Prioridade

Este plano cobre itens que devem ser resolvidos **logo após os críticos**, para garantir estabilidade, performance e manutenibilidade.

---

## 1. Performance

### 1.1 Paralelizar Queries com Promise.all()

**Problema:** Queries sequenciais no dashboard causam latência desnecessária.

**Arquivos afetados:**

#### Dashboard principal (`apps/web/src/app/dashboard/page.tsx`)

```typescript
// Antes (sequencial)
const { data: { user } } = await supabase.auth.getUser()
const stats = await getDetailedStats()
const heroData = await getHeroData()
const interviewStats = await getInterviewStats()
const access = await canUseInterviewPro(user?.id)

// Depois (paralelo)
const { data: { user } } = await supabase.auth.getUser()
const [stats, heroData, interviewStats, access] = await Promise.all([
  getDetailedStats(),
  getHeroData(),
  getInterviewStats(),
  canUseInterviewPro(user?.id),
])
```

#### getHeroData (`apps/web/src/app/dashboard/actions.ts`)

```typescript
// Paralelizar as 3 queries internas
const [applications, insights, recentInterview] = await Promise.all([
  supabase.from('applications').select('*')...,
  supabase.from('insights').select('*')...,
  supabase.from('interview_sessions').select('*')...,
])
```

#### getUserContext (`apps/web/src/app/dashboard/_components/copilot-chat/actions.ts`)

```typescript
// Paralelizar as 3 queries
const [applications, insights, interviewSessions] = await Promise.all([
  supabase.from('applications').select('*')...,
  supabase.from('insights').select('*')...,
  supabase.from('interview_sessions').select('*')...,
])
```

### 1.2 Adicionar Suspense Boundaries

**Arquivos afetados:**

- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/dashboard/aplicacoes/page.tsx`

**Solução:** Criar componentes async separados e envolver com Suspense

```typescript
// apps/web/src/app/dashboard/page.tsx
import { Suspense } from 'react'

export default async function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<HeroCardSkeleton />}>
        <HeroCardSection />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </div>
  )
}

// Componentes async separados
async function HeroCardSection() {
  const heroData = await getHeroData()
  return <HeroCard {...heroData} />
}
```

### 1.3 Lazy Load do CopilotDrawer

**Arquivo:** `apps/web/src/app/dashboard/_components/sidebar.tsx`

```typescript
// Antes
import { CopilotDrawer } from './copilot-chat/copilot-drawer'

// Depois
import dynamic from 'next/dynamic'

const CopilotDrawer = dynamic(
  () => import('./copilot-chat/copilot-drawer').then(mod => mod.CopilotDrawer),
  { ssr: false }
)
```

---

## 2. Controle de Estado

### 2.1 Corrigir Estado Duplicado do Copilot

**Arquivo:** `apps/web/src/app/dashboard/_components/copilot-chat/copilot-drawer.tsx`

**Problema:** Contexto vem de prop E do store Zustand (duas fontes de verdade)

```typescript
// Antes (linha 21-25)
const { insightContext: storeContext, ... } = useCopilotDrawer()
const insightContext = propContext || storeContext  // Duas fontes!

// Depois - Remover prop, usar apenas store
interface CopilotDrawerProps {}  // Remover insightContext prop

export function CopilotDrawer() {
  const { insightContext, heroContext, interviewContext, ... } = useCopilotDrawer()
  // Usar apenas do store
}
```

**Atualizar chamadas:** Remover passagem de prop onde `CopilotDrawer` é usado.

### 2.2 Adicionar revalidatePath('/dashboard') nas Mutations

**Arquivo:** `apps/web/src/app/dashboard/aplicacoes/actions.ts`

```typescript
// Em createApplication, updateApplication, deleteApplication, changeStatus
revalidatePath('/dashboard/aplicacoes')
revalidatePath('/dashboard')  // ADICIONAR - para atualizar stats do dashboard
```

### 2.3 Otimizar getUserContext

**Arquivo:** `apps/web/src/app/dashboard/_components/copilot-chat/actions.ts`

**Problema:** Chamado a cada mensagem, mesmo sem mudanças.

**Solução:** Aceitar contexto como parâmetro quando já disponível

```typescript
export async function sendChatMessage(
  message: string,
  history: Message[],
  context?: { insightContext?: InsightContext; heroContext?: HeroContext; interviewContext?: InterviewContext },
  cachedUserContext?: UserContext  // NOVO: contexto cacheado
) {
  const userContext = cachedUserContext || await getUserContext()
  // ...
}
```

---

## 3. Observabilidade

### 3.1 Implementar Sentry

**Instalar:**

```bash
npx @sentry/wizard@latest -i nextjs
```

**Arquivos a criar/configurar:**

- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.server.config.ts`
- `apps/web/sentry.edge.config.ts`
- Atualizar `apps/web/next.config.js`

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### 3.2 Criar Sistema de Logging Estruturado

**Criar arquivo:** `apps/web/src/lib/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  userId?: string
  requestId?: string
  feature?: string
  [key: string]: unknown
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Em produção: JSON estruturado
    console[level](JSON.stringify(logEntry))
  } else {
    // Em dev: formato legível
    console[level](`[${level.toUpperCase()}] ${message}`, context || '')
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),
}
```

**Substituir console.log/error** nos arquivos críticos:

- `apps/web/src/app/api/stripe/webhook/route.ts`
- `apps/web/src/app/dashboard/aplicacoes/actions.ts`
- `apps/web/src/app/dashboard/interview-pro/actions.ts`

### 3.3 Adicionar Error Boundaries

**Criar arquivo:** `apps/web/src/components/error-boundary.tsx`

```typescript
'use client'

import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@ui/components'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Algo deu errado</h2>
          <p className="text-navy/70 mb-4">Ocorreu um erro inesperado.</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Usar em:** `apps/web/src/app/dashboard/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
```

---

## 4. Qualidade de Código

### 4.1 Criar Helper getAuthenticatedUser()

**Criar/atualizar:** `apps/web/src/lib/supabase/server.ts`

```typescript
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { supabase, user: null, error: 'Não autenticado' }
  }
  
  return { supabase, user, error: null }
}
```

**Refatorar arquivos que repetem o padrão:**

- `apps/web/src/app/dashboard/aplicacoes/actions.ts`
- `apps/web/src/app/dashboard/interview-pro/actions.ts`
- `apps/web/src/lib/subscription/actions.ts`

```typescript
// Antes (repetido ~20 vezes)
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return { error: 'Não autenticado' }
}

// Depois
const { supabase, user, error } = await getAuthenticatedUser()
if (error) return { error }
```

### 4.2 Adicionar Error Handling em Operações Críticas

**Arquivos afetados:**

- `apps/web/src/app/dashboard/aplicacoes/actions.ts` (linhas 72, 195)
- `apps/web/src/lib/subscription/actions.ts`

```typescript
// Antes (erro ignorado)
const { error: historyError } = await supabase
  .from('status_history')
  .insert(...)
// historyError não é tratado!

// Depois
const { error: historyError } = await supabase
  .from('status_history')
  .insert(...)

if (historyError) {
  logger.error('Erro ao criar histórico de status', { 
    error: historyError.message,
    applicationId 
  })
  // Decidir: retornar erro ou continuar (depende da criticidade)
}
```

---

## 5. Custos de IA

### 5.1 Implementar Tracking de Tokens

**Criar migration:** `supabase/migrations/XXX_ai_usage_logs.sql`

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'copilot', 'hero_card', 'interview_question', 'interview_feedback'
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
```

**Criar helper:** `apps/web/src/lib/ai/usage-tracker.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

const PRICING = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 }, // per 1K tokens
}

export async function trackAIUsage(
  userId: string,
  feature: string,
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number }
) {
  const pricing = PRICING[model as keyof typeof PRICING]
  if (!pricing) return

  const estimatedCost = 
    (usage.prompt_tokens / 1000) * pricing.input +
    (usage.completion_tokens / 1000) * pricing.output

  const supabase = await createClient()
  await supabase.from('ai_usage_logs').insert({
    user_id: userId,
    feature,
    model,
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.prompt_tokens + usage.completion_tokens,
    estimated_cost: estimatedCost,
  })
}
```

**Usar após chamadas de IA:**

- `apps/web/src/app/dashboard/_components/copilot-chat/actions.ts`
- `apps/web/src/lib/hero/build-message.ts`
- `apps/web/src/app/dashboard/interview-pro/actions.ts`

---

## 6. Acessibilidade (Alta)

### 6.1 Adicionar Skip Link

**Arquivo:** `apps/web/src/app/dashboard/layout.tsx`

```typescript
export default function DashboardLayout({ children }) {
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>
      <Sidebar />
      <main id="main-content" className="...">
        {children}
      </main>
    </>
  )
}
```

### 6.2 Adicionar aria-label em Botões de Ícone

**Arquivos afetados:**

- `apps/web/src/app/dashboard/_components/copilot-chat/copilot-drawer.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/change-status-modal.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/delete-confirm-modal.tsx`
- `apps/web/src/app/insight/signup-modal.tsx`

```typescript
// Botão de fechar
<button aria-label="Fechar" onClick={onClose}>
  <X className="w-5 h-5" />
</button>

// Botão de nova conversa
<button aria-label="Nova conversa" onClick={handleReset}>
  <RotateCcw className="w-5 h-5" />
</button>
```

### 6.3 Adicionar role="alert" em Mensagens de Erro

**Arquivos afetados:**

- `apps/web/src/app/dashboard/aplicacoes/nova/form-flow.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/change-status-modal.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/delete-confirm-modal.tsx`

```typescript
// Antes
{error && <p className="text-red-500">{error}</p>}

// Depois
{error && <p role="alert" className="text-red-500">{error}</p>}
```

---

## Ordem de Execução Sugerida

1. **Qualidade 4.1** - Helper getAuthenticatedUser (base para outras mudanças)
2. **Performance 1.1** - Paralelizar queries
3. **Performance 1.2** - Suspense boundaries
4. **Estado 2.1** - Corrigir estado duplicado
5. **Estado 2.2** - revalidatePath dashboard
6. **Estado 2.3** - Otimizar getUserContext
7. **Observabilidade 3.1** - Sentry
8. **Observabilidade 3.2** - Logger estruturado
9. **Observabilidade 3.3** - Error Boundaries
10. **Qualidade 4.2** - Error handling
11. **Custos IA 5.1** - Tracking de tokens
12. **Acessibilidade 6.1** - Skip link
13. **Acessibilidade 6.2** - aria-labels
14. **Acessibilidade 6.3** - role="alert"

---

## Dependências a Instalar

```bash
npx @sentry/wizard@latest -i nextjs
```

