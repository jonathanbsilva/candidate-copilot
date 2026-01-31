---
name: Média Baixa Prioridade
overview: Melhorias de média e baixa prioridade em Performance, Qualidade, Estado, Acessibilidade, SEO e Custos de IA que refinam o projeto mas não são bloqueadores.
todos:
  - id: perf-memo
    content: Adicionar memoização em ChatMessages, SuggestedQuestions, ApplicationCard
    status: pending
  - id: perf-select
    content: Reduzir over-fetching com SELECT específico em queries
    status: pending
  - id: perf-client
    content: Converter ApplicationCard para Server Component
    status: pending
  - id: quality-constants
    content: Criar lib/constants.ts e substituir magic numbers
    status: pending
  - id: quality-console
    content: Limpar 46 console.log e substituir por logger
    status: pending
  - id: quality-refactor
    content: Refatorar funções longas (CopilotDrawer, detectContext)
    status: pending
  - id: state-race
    content: Corrigir race condition no PendingInsightSaver
    status: pending
  - id: state-stats
    content: Consolidar cálculo de stats em função única
    status: pending
  - id: state-reducer
    content: Reduzir useState em interview-pro/iniciar com useReducer
    status: pending
  - id: a11y-live
    content: Adicionar aria-live para conteúdo dinâmico no chat
    status: pending
  - id: a11y-hidden
    content: Adicionar aria-hidden em ícones decorativos
    status: pending
  - id: a11y-contrast
    content: Verificar e corrigir contraste de cores
    status: pending
  - id: seo-fonts
    content: Migrar fonts de @import para next/font
    status: pending
  - id: seo-jsonld
    content: Adicionar structured data JSON-LD na landing page
    status: pending
  - id: ai-context
    content: Reduzir contexto do Copilot (menos dados no prompt)
    status: pending
  - id: ai-cache
    content: Implementar cache de respostas do Copilot
    status: pending
  - id: ai-tokens
    content: Reduzir max_tokens no Hero Card e Interview Feedback
    status: pending
  - id: obs-health
    content: Criar endpoint /api/health para health check
    status: pending
isProject: false
---

# Plano: Correções de Média/Baixa Prioridade

Este plano cobre melhorias que refinam o projeto após os itens críticos e de alta prioridade estarem resolvidos.

---

## 1. Performance (Média)

### 1.1 Memoização em Componentes

**Arquivos afetados:**

#### ChatMessages - memoizar formatMarkdown e MessageBubble

`apps/web/src/app/dashboard/_components/copilot-chat/chat-messages.tsx`

```typescript
import { useMemo, memo } from 'react'

// Memoizar MessageBubble
const MessageBubble = memo(function MessageBubble({ message, isUser }: Props) {
  // ...
})

// No componente pai, memoizar formatação se necessário
const formattedContent = useMemo(() => formatMarkdown(message.content), [message.content])
```

#### SuggestedQuestions - memoizar grouped

`apps/web/src/app/dashboard/_components/copilot-chat/suggested-questions.tsx`

```typescript
const grouped = useMemo(() => {
  return questions.reduce((acc, q) => {
    // ... lógica de agrupamento
  }, {})
}, [questions])
```

#### ApplicationCard - memoizar formattedDate

`apps/web/src/app/dashboard/aplicacoes/_components/application-card.tsx`

```typescript
const formattedDate = useMemo(() => {
  return new Date(application.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}, [application.created_at])
```

### 1.2 Reduzir Over-fetching (SELECT específico)

**Arquivos afetados:**

#### getUserContext

`apps/web/src/app/dashboard/_components/copilot-chat/actions.ts`

```typescript
// Antes
const { data: applications } = await supabase.from('applications').select('*')

// Depois - selecionar apenas campos necessários
const { data: applications } = await supabase
  .from('applications')
  .select('id, cargo, empresa, status, created_at, updated_at')
```

#### getHeroData

`apps/web/src/app/dashboard/actions.ts`

```typescript
// Selecionar apenas campos usados
const { data: applications } = await supabase
  .from('applications')
  .select('id, cargo, empresa, status, created_at, status_history')
```

### 1.3 Converter Componentes Client Desnecessários

#### ApplicationCard para Server Component

`apps/web/src/app/dashboard/aplicacoes/_components/application-card.tsx`

```typescript
// Remover 'use client' - Link funciona em Server Components
// Se precisar de interatividade, extrair para componente filho
```

---

## 2. Qualidade de Código (Média)

### 2.1 Criar Arquivo de Constantes

**Criar:** `apps/web/src/lib/constants.ts`

```typescript
// Constantes de tempo
export const TIME_CONSTANTS = {
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 horas
  TIP_ROTATION_MS: 6 * 60 * 60 * 1000, // 6 horas
  INTERVIEW_FEEDBACK_WINDOW_HOURS: 24,
  FOLLOWUP_THRESHOLD_DAYS: 7,
  STALE_APPS_THRESHOLD_DAYS: 14,
  LOW_ACTIVITY_THRESHOLD_DAYS: 7,
} as const

// Constantes de entrevista
export const INTERVIEW_CONSTANTS = {
  MIN_ANSWERS_FOR_FEEDBACK: 3,
  QUESTIONS_PER_SESSION: 3,
} as const

// Constantes de IA
export const AI_CONSTANTS = {
  COPILOT_MAX_TOKENS: 1000,
  HERO_CARD_MAX_TOKENS: 80, // Reduzido de 150
  INTERVIEW_FEEDBACK_MAX_TOKENS: 700, // Reduzido de 1000
  CONTEXT_SLICE_LIMIT: 10,
} as const
```

**Substituir magic numbers** em:

- `apps/web/src/lib/hero/detect-context.ts`
- `apps/web/src/lib/hero/build-message.ts`
- `apps/web/src/app/dashboard/interview-pro/actions.ts`
- `apps/web/src/lib/copilot/context-builder.ts`

### 2.2 Limpar Console.log (46 ocorrências)

**Arquivos para limpar:**

```typescript
// Substituir por logger estruturado (criado no plano anterior)
// ou remover se for apenas debug

// Arquivos principais:
// - apps/web/src/app/dashboard/_components/pending-insight-saver.tsx (5)
// - apps/web/src/app/dashboard/aplicacoes/actions.ts (8)
// - apps/web/src/app/api/stripe/webhook/route.ts (6)
// - apps/web/src/app/dashboard/plano/stripe-buttons.tsx (7)
```

**Padrão de substituição:**

```typescript
// Antes
console.error('Erro ao criar item:', error)

// Depois
import { logger } from '@/lib/logger'
logger.error('Erro ao criar item', { error: error.message, context: 'createItem' })
```

### 2.3 Refatorar Funções Longas

#### CopilotDrawer - extrair lógica para hooks

`apps/web/src/app/dashboard/_components/copilot-chat/copilot-drawer.tsx`

**Criar:** `apps/web/src/hooks/use-copilot-chat.ts`

```typescript
export function useCopilotChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = useCallback(async (message: string) => {
    // ... lógica de envio
  }, [/* deps */])
  
  const handleReset = useCallback(() => {
    setMessages([])
    setInput('')
  }, [])
  
  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    handleSubmit,
    handleReset,
  }
}
```

#### detectContext - usar padrão Strategy

`apps/web/src/lib/hero/detect-context.ts`

```typescript
// Extrair cada condição para função separada
const contextDetectors = [
  detectPendingInsight,
  detectProposalReceived,
  detectInterviewSoon,
  detectInterviewFeedback,
  detectNeedsFollowup,
  detectStaleApps,
  detectLowActivity,
  detectNewUser,
]

export function detectContext(userData: UserData): HeroContext {
  for (const detector of contextDetectors) {
    const result = detector(userData)
    if (result) return result
  }
  return { type: 'active_summary', ...defaultData }
}
```

---

## 3. Controle de Estado (Média)

### 3.1 Corrigir Race Condition no PendingInsightSaver

`apps/web/src/app/dashboard/_components/pending-insight-saver.tsx`

```typescript
// Usar flag atômica com timestamp
useEffect(() => {
  const processPendingInsight = async () => {
    const pendingKey = 'pendingInsight'
    const lockKey = 'pendingInsightLock'
    
    // Verificar lock
    const lock = sessionStorage.getItem(lockKey)
    if (lock) {
      const lockTime = parseInt(lock)
      if (Date.now() - lockTime < 30000) return // Lock válido por 30s
    }
    
    const pendingInsight = localStorage.getItem(pendingKey)
    if (!pendingInsight) return
    
    // Criar lock
    sessionStorage.setItem(lockKey, Date.now().toString())
    
    try {
      // ... processar
      localStorage.removeItem(pendingKey)
    } finally {
      sessionStorage.removeItem(lockKey)
    }
  }
  
  processPendingInsight()
}, [])
```

### 3.2 Consolidar Cálculo de Stats

**Problema:** `getApplicationStats()` e `getDetailedStats()` fazem queries similares.

**Solução:** Criar função única que retorna todos os stats necessários.

`apps/web/src/app/dashboard/aplicacoes/actions.ts`

```typescript
export async function getAllStats(userId: string) {
  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at')
    .eq('user_id', userId)
  
  return {
    total: applications?.length || 0,
    byStatus: groupBy(applications, 'status'),
    thisMonth: applications?.filter(a => isThisMonth(a.created_at)).length || 0,
    // ... outros stats
  }
}
```

### 3.3 Reduzir useState em Interview Pro

`apps/web/src/app/dashboard/interview-pro/iniciar/page.tsx`

```typescript
// Antes: 8+ estados separados
// Depois: usar useReducer ou agrupar estados relacionados

interface InterviewFormState {
  step: 'context' | 'form'
  contextData: ContextData | null
  formData: {
    cargo: string
    area: string
    senioridade: string
    company: string
  }
  status: {
    isLoading: boolean
    isLoadingData: boolean
    error: string
  }
}

const [state, dispatch] = useReducer(interviewFormReducer, initialState)
```

---

## 4. Acessibilidade (Média/Baixa)

### 4.1 Adicionar aria-live para Conteúdo Dinâmico

`apps/web/src/app/dashboard/_components/copilot-chat/chat-messages.tsx`

```typescript
<div 
  role="log" 
  aria-live="polite" 
  aria-label="Mensagens do chat"
  className="..."
>
  {messages.map((message) => (
    <MessageBubble key={message.id} message={message} />
  ))}
</div>
```

### 4.2 Adicionar aria-hidden em Ícones Decorativos

**Arquivos afetados:**

- `packages/ui/src/button.tsx` (SVG de loading)
- `apps/web/src/app/dashboard/_components/copilot-chat/chat-messages.tsx`
- `apps/web/src/app/dashboard/_components/hero-card.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/application-card.tsx`

```typescript
// Antes
<Sparkles className="w-4 h-4" />

// Depois
<Sparkles className="w-4 h-4" aria-hidden="true" />
```

### 4.3 Verificar Contraste de Cores

**Classes a verificar:**

- `text-navy/60` - pode não atingir 4.5:1
- `text-navy/70` - verificar contraste
- `bg-stone/20 text-navy/60` - badges

**Ferramentas:** WebAIM Contrast Checker, axe DevTools

---

## 5. SEO (Média)

### 5.1 Migrar Fonts para next/font

`apps/web/src/app/layout.tsx`

```typescript
// Antes (em globals.css)
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

// Depois (em layout.tsx)
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Remover @import** de `apps/web/src/app/globals.css`

### 5.2 Adicionar Structured Data (JSON-LD)

`apps/web/src/app/page.tsx`

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GoHire Copilot',
  description: 'Decisões de carreira com clareza',
  url: 'https://copilot.gohire.work',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '19',
    priceCurrency: 'BRL',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* resto da página */}
    </>
  )
}
```

---

## 6. Custos de IA (Média)

### 6.1 Reduzir Contexto do Copilot

`apps/web/src/lib/copilot/context-builder.ts`

```typescript
// Antes: até 3 insights, 5 aplicações, histórico de entrevistas
// Depois: último insight, 3 aplicações mais recentes, sem entrevistas no padrão

function buildUserContext(data: UserData) {
  return {
    lastInsight: data.insights[0], // Apenas o mais recente
    recentApplications: data.applications.slice(0, 3), // Apenas 3
    // Remover entrevistas do contexto padrão
  }
}
```

### 6.2 Implementar Cache de Respostas do Copilot

`apps/web/src/app/dashboard/_components/copilot-chat/actions.ts`

```typescript
import { createHash } from 'crypto'

// Cache em memória (ou Redis para produção)
const responseCache = new Map<string, { response: string; timestamp: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 dias

function getCacheKey(message: string, contextHash: string) {
  return createHash('md5').update(`${message}:${contextHash}`).digest('hex')
}

export async function sendChatMessage(message: string, ...) {
  const contextHash = hashContext(insightContext, heroContext)
  const cacheKey = getCacheKey(message, contextHash)
  
  // Verificar cache
  const cached = responseCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { response: cached.response, cached: true }
  }
  
  // ... fazer chamada de IA
  
  // Salvar no cache
  responseCache.set(cacheKey, { response, timestamp: Date.now() })
  
  return { response, cached: false }
}
```

### 6.3 Reduzir max_tokens

**Arquivos afetados:**

```typescript
// Hero Card: 150 → 80
// apps/web/src/lib/hero/build-message.ts
max_tokens: 80,

// Interview Feedback: 1000 → 700
// apps/web/src/app/dashboard/interview-pro/actions.ts
max_tokens: 700,
```

---

## 7. Observabilidade (Baixa)

### 7.1 Criar Health Check Endpoint

**Criar:** `apps/web/src/app/api/health/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, 'ok' | 'error'>,
  }
  
  // Verificar Supabase
  try {
    const supabase = await createClient()
    await supabase.from('user_profiles').select('count').limit(1)
    checks.services.supabase = 'ok'
  } catch {
    checks.services.supabase = 'error'
    checks.status = 'degraded'
  }
  
  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  })
}
```

---

## Ordem de Execução Sugerida

1. **Qualidade 2.1** - Criar constants.ts
2. **Qualidade 2.2** - Limpar console.log
3. **SEO 5.1** - Migrar fonts para next/font
4. **Performance 1.2** - Reduzir over-fetching (SELECT específico)
5. **Performance 1.1** - Memoização
6. **Custos IA 6.3** - Reduzir max_tokens
7. **Custos IA 6.1** - Reduzir contexto Copilot
8. **Acessibilidade 4.2** - aria-hidden em ícones
9. **Acessibilidade 4.1** - aria-live no chat
10. **Estado 3.2** - Consolidar stats
11. **Qualidade 2.3** - Refatorar funções longas
12. **Estado 3.1** - Race condition pending insight
13. **Estado 3.3** - Reduzir useState
14. **Custos IA 6.2** - Cache de respostas
15. **SEO 5.2** - Structured data
16. **Observabilidade 7.1** - Health check
17. **Performance 1.3** - Converter Client Components
18. **Acessibilidade 4.3** - Verificar contraste

> **Nota:** `role="dialog"` nos modais será incluído automaticamente ao usar o componente Modal base do Plano de Componentização.

