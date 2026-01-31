# Engineering Rules - GoHire Copilot

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict) |
| Styling | TailwindCSS |
| Components | shadcn/ui (packages/ui) |
| Forms | react-hook-form + zod |
| State | Zustand (client) / Server Actions (mutations) |
| Database | Supabase (Postgres + Auth + RLS) |
| AI | OpenAI (gpt-4o-mini) |
| Payments | Stripe |
| Analytics | PostHog + Google Analytics 4 |

## Principios de Arquitetura

### Manual-First
- CRUD solido e rapido antes de automatizacao
- Features manuais funcionam sem IA

### IA Assincrona
- Enrichment nunca bloqueia fluxo
- Fallbacks quando IA falha

### Auditoria
- Status history sempre preservado (timeline)
- Nao deletar, soft-delete quando possivel

### Observabilidade
- Logs estruturados com `@/lib/logger` (NAO usar console.log/error)
- Error tracking com Sentry (configurado em sentry.*.config.ts)
- ErrorBoundary para capturar erros de React
- Eventos de analytics para acoes importantes
- AI usage tracking para controle de custos

## Estrutura de Pastas

```
apps/web/src/
├── app/                    # Pages (App Router)
│   ├── dashboard/          # Area autenticada
│   │   ├── _components/    # Componentes do dashboard
│   │   ├── aplicacoes/     # Feature de aplicacoes
│   │   ├── insights/       # Feature de insights
│   │   ├── interview-pro/  # Feature de entrevistas
│   │   └── actions.ts      # Server actions
│   └── api/                # API routes (somente quando necessario)
├── components/             # Componentes compartilhados
├── hooks/                  # Hooks e stores Zustand
└── lib/                    # Logica de negocio
    ├── ai/                 # Providers e seguranca de IA
    ├── copilot/            # Logica do chat
    ├── subscription/       # Controle de acesso
    └── supabase/           # Clientes Supabase
```

## Server Components vs Client

### Server Components (padrao)
- Paginas
- Layouts
- Fetch de dados
- Acesso ao banco

### Client Components ('use client')
- Interatividade (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs
- Animacoes

## Server Actions

### Quando Usar
- Mutacoes (create, update, delete)
- Operacoes autenticadas
- Validacao server-side

### Helper de Autenticacao
SEMPRE usar `getAuthenticatedUser()` em vez de repetir o padrao manualmente.

```typescript
import { getAuthenticatedUser } from '@/lib/supabase/server'

const { supabase, user, error } = await getAuthenticatedUser()
if (error || !user) {
  return { error: error || 'Nao autenticado' }
}
```

### Padrao Completo
```typescript
'use server'

import { getAuthenticatedUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function myAction(data: MyData) {
  // 1. Autenticacao
  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return { error: authError || 'Nao autenticado' }
  }
  
  // 2. Verificar limites
  const access = await canUseFeature(user.id)
  if (!access.allowed) {
    return { error: 'Limite atingido', limitReached: true }
  }
  
  // 3. Logica
  const { data: result, error } = await supabase.from('table').insert(...)
  
  if (error) {
    logger.error('Erro na operacao', { error: error.message, userId: user.id, feature: 'myFeature' })
    return { error: 'Erro ao processar' }
  }
  
  // 4. SEMPRE revalidar /dashboard alem da rota especifica
  revalidatePath('/dashboard/items')
  revalidatePath('/dashboard')
  
  return { success: true, data: result }
}
```

## Database (Supabase)

### RLS Obrigatorio
- Toda tabela tem RLS habilitado
- Policies para SELECT, INSERT, UPDATE, DELETE

### Migrations
- Arquivos em `supabase/migrations/`
- Nomenclatura: `XXX_descricao.sql`
- Sempre testar localmente antes

## Validacao

### Zod para Schemas
```typescript
const schema = z.object({
  cargo: z.string().min(2),
  area: z.string().optional(),
})
```

### Validar em Server Actions
```typescript
const parsed = schema.safeParse(data)
if (!parsed.success) {
  return { error: 'Dados invalidos' }
}
```

### UUID Validation (OBRIGATORIO)
```typescript
import { validateUUID } from '@/lib/schemas/uuid'

// SEMPRE validar UUIDs antes de queries
const uuidValidation = validateUUID(id)
if (!uuidValidation.success) {
  return { error: uuidValidation.error }
}
```

## Seguranca

### XSS Prevention
- NUNCA usar `dangerouslySetInnerHTML` com conteudo de usuario
- Para markdown, usar `react-markdown` com wrapper div (v9+ nao aceita className)
- Sanitizar inputs antes de salvar no banco

### Rate Limiting
- API routes devem ter rate limiting
- Usar `@/lib/rate-limit` para limites por IP
- Limites padroes em `RATE_LIMITS` (chat: 20/min, coupon: 10/min)

### Input Validation
- Sempre validar UUIDs antes de queries (usar `validateUUID`)
- Schemas Zod para todos os inputs de usuario
- Nunca confiar em dados do cliente

## LGPD Compliance

### Paginas Obrigatorias
- `/privacidade` - Politica de Privacidade
- `/termos` - Termos de Uso

### Cookie Consent
- Banner de consentimento para cookies analiticos
- Analytics (PostHog, GA) so carregam apos consentimento
- Usar `CookieConsentBanner` no layout

### Links Legais
- Footer de todas as paginas deve ter links para /privacidade e /termos
- Na tela de auth, links devem abrir em nova aba (`target="_blank"`)

## Acessibilidade (A11y)

### Skip Link
Dashboard layout tem skip link para pular navegacao:
```typescript
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Pular para o conteúdo principal
</a>
```

### Modais
- Usar `useFocusTrap` para travar foco dentro do modal
- Atributos obrigatorios: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Overlay deve ter `aria-hidden="true"`
- Botao de fechar deve ter `aria-label="Fechar"`

### Mensagens de Erro
- SEMPRE usar `role="alert"` em mensagens de erro
```typescript
{error && <p role="alert" className="text-red-600">{error}</p>}
```

### Botoes de Icone
- SEMPRE usar `aria-label` em botoes com apenas icones
- Icones devem ter `aria-hidden="true"`
```typescript
<button aria-label="Fechar">
  <X aria-hidden="true" />
</button>
```

## Observabilidade

### Logger Estruturado
NUNCA usar `console.log/error` em server actions ou API routes. Usar `@/lib/logger`.

```typescript
import { logger } from '@/lib/logger'

logger.info('Evento', { userId, feature })
logger.warn('Aviso', { error, context })
logger.error('Erro critico', { error, userId, feature })
logger.debug('Debug', { data }) // so aparece em dev
```

### Sentry
Error tracking configurado em `sentry.*.config.ts`. Captura automatica de erros.
- Habilitado quando `NEXT_PUBLIC_SENTRY_DSN` esta definido
- ErrorBoundary reporta erros para Sentry automaticamente

### ErrorBoundary
Usar em layouts para capturar erros de React:
```typescript
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary>
  {children}
</ErrorBoundary>
```

### AI Usage Tracking
Para rastrear custos de IA:
```typescript
import { trackAIUsage } from '@/lib/ai/usage-tracker'

await trackAIUsage(userId, 'copilot', 'gpt-4o-mini', {
  prompt_tokens: response.usage.prompt_tokens,
  completion_tokens: response.usage.completion_tokens,
})
```
