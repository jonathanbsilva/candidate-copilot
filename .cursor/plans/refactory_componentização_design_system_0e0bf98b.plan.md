---
name: Componentização Design System
overview: Melhorar reutilização de código através de componentes compartilhados, hooks customizados, utils centralizados e consistência do design system.
todos:
  - id: tokens-error
    content: Adicionar tokens de erro/success/info ao Tailwind config
    status: pending
  - id: utils-date
    content: Criar lib/utils/date.ts com formatDate, formatDateTime, formatRelativeTime
    status: pending
  - id: utils-zod
    content: Criar lib/utils/zod.ts com extractFieldErrors, getFirstError
    status: pending
  - id: types-actions
    content: Criar lib/server-actions/types.ts com ActionResult e AccessCheck
    status: pending
  - id: ui-modal
    content: Criar packages/ui/src/modal.tsx com focus trap e acessibilidade
    status: pending
  - id: ui-empty
    content: Criar packages/ui/src/empty-state.tsx reutilizável
    status: pending
  - id: ui-skeleton
    content: Criar packages/ui/src/skeleton.tsx com variantes
    status: pending
  - id: ui-iconbadge
    content: Criar packages/ui/src/icon-badge.tsx para ícones circulares
    status: pending
  - id: ui-metric
    content: Criar packages/ui/src/metric-card.tsx para cards de métrica
    status: pending
  - id: ui-badge
    content: Atualizar Badge para usar tokens de cor do sistema
    status: pending
  - id: hook-action
    content: Criar hooks/use-server-action.ts para Server Actions
    status: pending
  - id: hook-validation
    content: Criar hooks/use-form-validation.ts para validação Zod
    status: pending
  - id: comp-backlink
    content: Criar components/back-link.tsx reutilizável
    status: pending
  - id: comp-timeline
    content: Criar components/timeline.tsx genérica
    status: pending
  - id: comp-appform
    content: Criar application-form.tsx compartilhado para criar/editar
    status: pending
  - id: refactor-modals
    content: Refatorar modais existentes para usar Modal base
    status: pending
  - id: refactor-empty
    content: Refatorar empty states para usar EmptyState
    status: pending
  - id: refactor-colors
    content: Substituir cores hardcoded por tokens do sistema
    status: pending
isProject: false
---

# Plano: Componentização e Design System

Este plano cobre melhorias de reutilização, padronização e consistência visual do projeto.

---

## 1. Componentes UI Faltando

### 1.1 Criar Componente Modal Base

**Problema:** 3 modais com ~80% de código duplicado.

**Criar:** `packages/ui/src/modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  const containerRef = useFocusTrap(isOpen)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-navy/50" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative bg-white rounded-lg shadow-lg mx-4 p-6',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
        )}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-navy/40 hover:text-navy"
        >
          <X className="w-5 h-5" />
        </button>
        {title && <h2 id="modal-title" className="text-lg font-semibold mb-2">{title}</h2>}
        {description && <p className="text-navy/70 mb-4">{description}</p>}
        {children}
      </div>
    </div>
  )
}
```

**Refatorar:**

- `apps/web/src/app/dashboard/aplicacoes/_components/change-status-modal.tsx`
- `apps/web/src/app/dashboard/aplicacoes/_components/delete-confirm-modal.tsx`
- `apps/web/src/app/insight/signup-modal.tsx`

### 1.2 Criar Componente EmptyState

**Problema:** 4+ arquivos com estrutura idêntica de empty state.

**Criar:** `packages/ui/src/empty-state.tsx`

```typescript
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="w-12 h-12 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-navy/70 mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Card>
  )
}
```

**Refatorar:**

- `apps/web/src/app/dashboard/insights/page.tsx`
- `apps/web/src/app/dashboard/aplicacoes/page.tsx`
- `apps/web/src/app/dashboard/interview-pro/page.tsx`
- `apps/web/src/app/dashboard/interview-pro/historico/page.tsx`

### 1.3 Criar Componente Skeleton

**Criar:** `packages/ui/src/skeleton.tsx`

```typescript
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-stone/30',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
    />
  )
}

// Variantes compostas
export function SkeletonCard() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </Card>
  )
}
```

### 1.4 Criar Componente IconBadge

**Problema:** 69 ocorrências do mesmo padrão de ícone circular.

**Criar:** `packages/ui/src/icon-badge.tsx`

```typescript
interface IconBadgeProps {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'amber' | 'teal' | 'stone' | 'navy'
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const colors = {
  amber: 'bg-amber/20 text-amber',
  teal: 'bg-teal/20 text-teal',
  stone: 'bg-stone/20 text-stone',
  navy: 'bg-navy/10 text-navy',
}

export function IconBadge({ icon, size = 'md', color = 'stone' }: IconBadgeProps) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      sizes[size],
      colors[color]
    )}>
      {icon}
    </div>
  )
}
```

### 1.5 Criar Componente MetricCard

**Criar:** `packages/ui/src/metric-card.tsx`

```typescript
interface MetricCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  description?: string
  color?: 'amber' | 'teal' | 'stone' | 'navy'
}

export function MetricCard({ icon, value, label, description, color = 'stone' }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <IconBadge icon={icon} size="md" color={color} />
        <div>
          <div className="text-2xl font-bold text-navy">{value}</div>
          <div className="text-sm text-navy/70">{label}</div>
          {description && <div className="text-xs text-navy/50">{description}</div>}
        </div>
      </div>
    </Card>
  )
}
```

---

## 2. Componentes de Aplicação

### 2.1 Criar BackLink Reutilizável

**Problema:** 5 ocorrências idênticas.

**Criar:** `apps/web/src/components/back-link.tsx`

```typescript
interface BackLinkProps {
  href: string
  label?: string
}

export function BackLink({ href, label = 'Voltar' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  )
}
```

### 2.2 Criar ApplicationForm Reutilizável

**Problema:** Formulário duplicado em criar/editar.

**Criar:** `apps/web/src/app/dashboard/aplicacoes/_components/application-form.tsx`

```typescript
interface ApplicationFormProps {
  initialData?: Partial<ApplicationData>
  onSubmit: (data: ApplicationData) => Promise<{ error?: string }>
  submitLabel: string
}

export function ApplicationForm({ initialData, onSubmit, submitLabel }: ApplicationFormProps) {
  // Lógica compartilhada de validação e submissão
}
```

**Refatorar:**

- `apps/web/src/app/dashboard/aplicacoes/nova/form-flow.tsx`
- `apps/web/src/app/dashboard/aplicacoes/[id]/editar/page.tsx`

### 2.3 Criar Timeline Genérica

**Criar:** `apps/web/src/components/timeline.tsx`

```typescript
interface TimelineItem {
  id: string
  date: string
  title: string
  description?: string
  icon?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  emptyMessage?: string
}

export function Timeline({ items, emptyMessage }: TimelineProps) {
  if (items.length === 0 && emptyMessage) {
    return <p className="text-navy/60 text-sm">{emptyMessage}</p>
  }
  
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-stone/30" />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative pl-8">
            <div className="absolute left-0 w-6 h-6 bg-white border-2 border-stone/30 rounded-full" />
            <div className="text-xs text-navy/50">{item.date}</div>
            <div className="font-medium text-navy">{item.title}</div>
            {item.description && <div className="text-sm text-navy/70">{item.description}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 3. Hooks Customizados

### 3.1 Criar useServerAction

**Problema:** Padrão repetido em 10+ componentes.

**Criar:** `apps/web/src/hooks/use-server-action.ts`

```typescript
interface UseServerActionOptions<TResult> {
  onSuccess?: (result: TResult) => void
  onError?: (error: string) => void
}

export function useServerAction<TInput, TResult>(
  action: (input: TInput) => Promise<{ error?: string } & TResult>,
  options?: UseServerActionOptions<TResult>
) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const execute = useCallback((input: TInput) => {
    setError(null)
    startTransition(async () => {
      const result = await action(input)
      if (result.error) {
        setError(result.error)
        options?.onError?.(result.error)
      } else {
        options?.onSuccess?.(result)
      }
    })
  }, [action, options])
  
  return { execute, isPending, error, clearError: () => setError(null) }
}
```

### 3.2 Criar useFormValidation

**Criar:** `apps/web/src/hooks/use-form-validation.ts`

```typescript
export function useFormValidation<T extends z.ZodSchema>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = useCallback((data: unknown): data is z.infer<T> => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }, [schema])
  
  return { errors, validate, setErrors, clearErrors: () => setErrors({}) }
}
```

---

## 4. Utils Centralizados

### 4.1 Criar lib/utils/date.ts

**Problema:** Formatação de data duplicada em 6+ arquivos.

```typescript
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const date = new Date(dateString)
  
  const formats = {
    short: { day: '2-digit', month: 'short' } as const,
    long: { day: '2-digit', month: 'long', year: 'numeric' } as const,
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' } as const,
  }
  
  return date.toLocaleDateString('pt-BR', formats[format])
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
  return formatDate(dateString, 'short')
}
```

### 4.2 Criar lib/utils/zod.ts

```typescript
import { ZodError } from 'zod'

export function extractFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  error.errors.forEach((err) => {
    if (err.path[0]) {
      fieldErrors[err.path[0] as string] = err.message
    }
  })
  return fieldErrors
}

export function getFirstError(error: ZodError): string {
  return error.errors[0]?.message || 'Erro de validação'
}
```

### 4.3 Criar lib/server-actions/types.ts

```typescript
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; limitReached?: boolean }

export type AccessCheck = {
  allowed: boolean
  plan: 'free' | 'pro'
  remaining?: number
  limit?: number
  current?: number
}
```

---

## 5. Design System - Tokens e Consistência

### 5.1 Adicionar Tokens de Erro

**Atualizar:** `apps/web/tailwind.config.ts`

```typescript
colors: {
  // Existentes
  navy: '#1a1a2e',
  sand: '#faf6f1',
  stone: '#a3a3a3',
  amber: '#f59e0b',
  teal: '#14b8a6',
  // ADICIONAR
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
}
```

### 5.2 Atualizar Badge com Tokens

**Atualizar:** `packages/ui/src/badge.tsx`

Substituir cores hardcoded (`red-*`, `blue-*`) pelos tokens.

### 5.3 Padronizar Espaçamentos de Card

**Documentar padrão:**

- `p-4`: Cards compactos (lista, métricas inline)
- `p-6`: Cards padrão (conteúdo principal)
- `p-8`: Empty states, destaque

### 5.4 Substituir Cores Hardcoded

**Arquivos para refatorar:**

- `apps/web/src/app/dashboard/_components/metrics-cards.tsx` — `bg-blue-50` → `bg-info/10`
- `apps/web/src/app/dashboard/aplicacoes/_components/application-funnel.tsx` — `bg-blue-400` → `bg-info`
- Todos os `text-red-600` → `text-error`

---

## Ordem de Execução Sugerida

### Fase 1: Fundação (Tokens e Utils)

1. Adicionar tokens de erro ao Tailwind
2. Criar `lib/utils/date.ts`
3. Criar `lib/utils/zod.ts`
4. Criar `lib/server-actions/types.ts`

### Fase 2: Componentes Base UI

1. Criar `packages/ui/src/modal.tsx`
2. Criar `packages/ui/src/empty-state.tsx`
3. Criar `packages/ui/src/skeleton.tsx`
4. Criar `packages/ui/src/icon-badge.tsx`
5. Criar `packages/ui/src/metric-card.tsx`
6. Atualizar Badge com tokens

### Fase 3: Hooks

1. Criar `hooks/use-server-action.ts`
2. Criar `hooks/use-form-validation.ts`

### Fase 4: Componentes de App

1. Criar `components/back-link.tsx`
2. Criar `components/timeline.tsx`
3. Criar `aplicacoes/_components/application-form.tsx`

### Fase 5: Refatoração

1. Refatorar modais para usar Modal base
2. Refatorar empty states para usar EmptyState
3. Substituir cores hardcoded
4. Refatorar formulários de aplicação

---

## Métricas de Sucesso

- Redução de ~30-40% em código duplicado
- 5+ novos componentes reutilizáveis no design system
- 3+ hooks customizados compartilhados
- 100% das cores usando tokens do sistema
- Padrões documentados para espaçamentos

