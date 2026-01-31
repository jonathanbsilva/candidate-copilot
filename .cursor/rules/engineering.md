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
- Logs estruturados
- Eventos de analytics para acoes importantes

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

### Padrao
```typescript
'use server'

export async function myAction(data: MyData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Nao autenticado' }
  }
  
  // Verificar limites
  const access = await canUseFeature(user.id)
  if (!access.allowed) {
    return { error: 'Limite atingido', limitReached: true }
  }
  
  // Logica
  const result = await supabase.from('table').insert(...)
  
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
