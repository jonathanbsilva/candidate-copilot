# Code Patterns - GoHire Copilot

## Supabase Client

```typescript
// Server Components/Actions
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## UUID Validation (OBRIGATORIO)

Sempre validar UUIDs antes de queries no banco para evitar erros e ataques.

```typescript
import { validateUUID } from '@/lib/schemas/uuid'

export async function getItem(id: string) {
  // SEMPRE validar UUID antes da query
  const uuidValidation = validateUUID(id)
  if (!uuidValidation.success) {
    return { error: uuidValidation.error, data: null }
  }

  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('id', uuidValidation.data) // usar o valor validado
    .single()
  
  return { data }
}
```

## Rate Limiting (API Routes)

```typescript
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Rate limiting no inicio da rota
  const { response: rateLimitResponse } = rateLimitMiddleware(req, RATE_LIMITS.chat)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  // ... resto da logica
}
```

## Server Action Completa

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(data: ItemData): Promise<{
  success?: boolean
  error?: string
  data?: Item
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Nao autenticado' }
  }
  
  // Verificar limites (se aplicavel)
  const access = await canUseFeature(user.id)
  if (!access.allowed) {
    return { error: 'Limite atingido' }
  }
  
  const { data: item, error } = await supabase
    .from('items')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar item:', error)
    return { error: 'Erro ao criar item' }
  }
  
  revalidatePath('/dashboard/items')
  return { success: true, data: item }
}
```

## Subscription Check

```typescript
// Em Server Component
import { canUseFeature } from '@/lib/subscription/check-access'

export default async function Page() {
  const access = await canUseFeature(user.id)
  
  if (!access.allowed) {
    return <UpgradePrompt remaining={access.remaining} limit={access.limit} />
  }
  
  // Render normal...
}
```

## UI Components

```typescript
import { Button, Card, Input, Badge, Progress } from '@ui/components'

// Botoes
<Button>Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="ghost">Ghost</Button>
<Button isLoading>Carregando...</Button>

// Cards
<Card>Default</Card>
<Card variant="elevated">Elevado</Card>

// Badges
<Badge>Default</Badge>
<Badge className="bg-teal/20 text-teal">Ativo</Badge>
<Badge className="bg-amber/20 text-amber">Pro</Badge>
```

## Analytics

```typescript
import { track } from '@/lib/analytics/track'

// Eventos
track('insight_generated', { objetivo: 'nova_oportunidade' })
track('interview_started', { cargo: 'PM', senioridade: 'senior' })
track('application_created', { status: 'aplicado' })
```

## Copilot Context

```typescript
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'

const { 
  open,
  openWithContext,
  openWithHeroContext,
  openWithInterviewContext,
  close,
  clearContext 
} = useCopilotDrawer()

// Abrir com contexto de insight
openWithContext({
  id: insight.id,
  tipo: insight.objetivo,
  cargo: insight.cargo,
  recommendation: insight.recommendation,
  next_steps: insight.next_steps,
})

// Abrir com contexto de entrevista
openWithInterviewContext({
  sessionId: session.id,
  cargo: session.cargo,
  score: session.overall_score,
  summary: feedback.summary,
  strengths: [...],
  improvements: [...],
  tips: feedback.general_tips,
})
```

## Hero Card Context Detection

```typescript
// lib/hero/detect-context.ts
// Prioridade de contextos:
// 1. pending_insight
// 2. proposal_received
// 3. interview_soon
// 4. interview_feedback
// 5. needs_followup
// 6. stale_apps
// 7. low_activity
// 8. new_user
// 9. active_summary (default)
```

## Responsive Layout

```typescript
// Mobile-first, empilha no mobile, lado a lado no desktop
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>Conteudo</div>
  <Button className="w-full sm:w-auto">Acao</Button>
</div>

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Loading States

```typescript
// Skeleton
<div className="animate-pulse">
  <div className="h-4 bg-stone/30 rounded w-3/4 mb-2" />
  <div className="h-4 bg-stone/30 rounded w-1/2" />
</div>

// Spinner
import { Loader2 } from 'lucide-react'
<Loader2 className="w-6 h-6 animate-spin" />
```

## Empty States

```typescript
<Card className="p-8 text-center">
  <div className="w-12 h-12 bg-stone/20 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon className="w-6 h-6 text-navy/50" />
  </div>
  <h3 className="text-lg font-semibold text-navy mb-2">
    Nenhum item ainda
  </h3>
  <p className="text-navy/70 mb-6">
    Comece adicionando seu primeiro item.
  </p>
  <Button>Adicionar</Button>
</Card>
```

## Error Handling

```typescript
// Em Server Action
try {
  // logica
} catch (error) {
  console.error('Erro:', error)
  return { error: 'Ocorreu um erro. Tente novamente.' }
}

// Em Client Component
const [error, setError] = useState('')

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">{error}</p>
      <Button variant="ghost" onClick={() => setError('')}>
        Tentar novamente
      </Button>
    </div>
  )
}
```

## Form Pattern

```typescript
'use client'

import { useState } from 'react'
import { Button, Input } from '@ui/components'

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await myAction(data)
      if (result.error) {
        setError(result.error)
      } else {
        // sucesso
      }
    } catch {
      setError('Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input ... />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" isLoading={isLoading}>
        Enviar
      </Button>
    </form>
  )
}
```

## Markdown Rendering (react-markdown)

IMPORTANTE: react-markdown v9+ NAO aceita `className` diretamente. Usar wrapper div.

```typescript
// ERRADO - vai dar erro
<ReactMarkdown className="prose prose-sm">
  {content}
</ReactMarkdown>

// CERTO - wrapper div com className
<div className="prose prose-sm prose-navy max-w-none">
  <ReactMarkdown>
    {content}
  </ReactMarkdown>
</div>
```

## Modal com Focus Trap (Acessibilidade)

```typescript
import { useFocusTrap } from '@/hooks/use-focus-trap'

export function MyModal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-navy/50" onClick={onClose} aria-hidden="true" />
      <div 
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white rounded-lg p-6"
      >
        <h2 id="modal-title">Titulo</h2>
        {/* conteudo */}
      </div>
    </div>
  )
}
```

## Open Graph Metadata

SEMPRE definir metadataBase no layout para evitar warnings de build.

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://copilot.gohire.work'),
  title: 'GoHire Copilot',
  description: '...',
  openGraph: {
    title: '...',
    description: '...',
    images: ['/og-image.png'],
    locale: 'pt_BR',
    type: 'website',
  },
}
```

## Links Externos/Legais

Links de Termos e Privacidade devem abrir em nova aba.

```typescript
<Link href="/termos" target="_blank" className="text-teal hover:underline">
  Termos de Uso
</Link>
```
