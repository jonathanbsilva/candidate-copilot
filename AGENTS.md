# GoHire Copilot - Agent Guide

> **North Star**: Clareza para decisoes de carreira (nao "um tracker de vagas")

## Quick Start

```bash
cd apps/web
npm run dev          # http://localhost:3000
npm run lint         # check linting
```

**Supabase**: Migrations em `supabase/migrations/`. Rodar localmente com `supabase start`.

**Teste Mobile**: Sempre testar no DevTools com viewports 375px (iPhone SE) e 390px (iPhone 14).

---

## Roadmap e Futuro

Para discussoes de produto, backlog ou futuro:
- **Ler**: `docs/ROADMAP.md` (fonte unica de verdade)
- **Executar**: ver `.cursor/plans/` para planos detalhados

---

## Rules (Leitura Obrigatoria)

Regras detalhadas em `.cursor/rules/`:

| Arquivo | Conteudo |
|---------|----------|
| `project.md` | Idioma, do's e don'ts |
| `product.md` | North Star, Product Truths, Limites |
| `ux.md` | UX Skills, Copy, Tom, Estados, **Mobile Checklist** |
| `design.md` | Paleta Warm Intelligence, Componentes, **Mobile Patterns** |
| `ai.md` | Postura Copilot, Guardrails, Formatos |
| `engineering.md` | Stack, Arquitetura, Server Actions |
| `patterns.md` | Code snippets reutilizaveis, **Mobile Code Patterns** |
| `workflow.md` | DoD, PRs, Commits |
| `roadmap.md` | Disciplina de leitura/atualizacao do Roadmap |
| `growth.md` | Estrategias de aquisicao, canais, metricas, tom de conteudo |

> **IMPORTANTE**: Ao criar/editar componentes de UI, SEMPRE consultar a secao "Mobile Patterns" em `design.md` e `patterns.md`.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS + shadcn/ui (`packages/ui`)
- **Database**: Supabase (Postgres + Auth + RLS)
- **AI**: OpenAI (gpt-4o-mini)
- **Payments**: Stripe
- **Analytics**: PostHog + Google Analytics 4
- **State**: Zustand (client), Server Actions (mutations)

---

## Architecture

```
apps/web/src/
├── app/                    # Pages (App Router)
│   ├── dashboard/          # Area autenticada
│   │   ├── _components/    # Componentes do dashboard
│   │   ├── aplicacoes/     # Tracking de vagas
│   │   ├── insights/       # Insights de carreira
│   │   ├── interview-pro/  # Mock interviews
│   │   ├── plano/          # Subscription
│   │   └── actions.ts      # Server actions
│   ├── auth/               # Autenticacao
│   ├── comecar/            # Entry flow (onboarding)
│   └── insight/            # Pagina publica de insight
├── components/             # Componentes compartilhados
├── hooks/                  # Hooks e stores Zustand
└── lib/
    ├── ai/                 # Providers e seguranca
    ├── copilot/            # Logica do chat
    ├── hero/               # Hero Card adaptativo
    ├── subscription/       # Controle de acesso
    └── supabase/           # Clientes Supabase

packages/
├── ui/                     # Design system (Button, Card, etc.)
└── lib/                    # Utilities compartilhadas
```

---

## Features Implementadas

### Entry Flow
- Usuario responde 3 perguntas sem cadastro
- Recebe primeiro insight de carreira
- Pode criar conta depois para salvar

### Applications Tracking
- CRUD de candidaturas
- Status timeline (historico)
- Metricas (taxa de conversao, etc.)

### Copilot Chat
- Chat contextual no sidebar
- Contextos: insight, hero card, interview feedback, application/proposta
- CTAs contextuais baseados no objetivo do usuario
- Verifica propostas ativas para sugerir adicionar nova
- Respostas diretas do DB quando possivel (economia de tokens)
- Limites: Free 5/dia, Pro ilimitado

### Entrevista IA
- Mock interviews com IA (modo texto)
- Free: 1 trial vitalicio
- Pro: ilimitado
- Feedback detalhado por pergunta

### Hero Card
- Card adaptativo no dashboard
- Detecta contexto (proposta, entrevista, follow-up, etc.)
- Mensagens personalizadas (templates + IA)

### Subscription
- Free: limites mensais
- Pro: R$ 19/mes via Stripe
- Cupons de desconto

---

## Subscription Limits

```typescript
// lib/subscription/limits.ts
FREE_INSIGHTS_LIMIT = 3        // por mes
FREE_APPLICATIONS_LIMIT = 5    // por mes
FREE_COPILOT_DAILY_LIMIT = 5   // por dia
FREE_INTERVIEWS_LIMIT = 1      // trial vitalicio
```

### Funcoes de Verificacao
```typescript
import { 
  canGenerateInsight,
  canAddApplication,
  canUseCopilot,
  canUseInterviewPro 
} from '@/lib/subscription/check-access'
```

---

## Database Tables

| Tabela | Descricao |
|--------|-----------|
| `user_profiles` | Plano, contadores, subscription |
| `applications` | Vagas do usuario |
| `insights` | Insights gerados |
| `interview_sessions` | Sessoes de mock interview |
| `waitlist` | Lista de espera |

RLS habilitado em todas as tabelas.

---

## Decisoes Arquiteturais

1. **Server Components por padrao** - Client apenas quando necessario
2. **Server Actions para mutacoes** - Nao usar API routes
3. **Entrevista IA Trial** - Free users tem 1 entrevista gratis
4. **Copilot sem restricoes Pro** - Todo usuario pode usar contexto de entrevista
5. **Hero Card hibrido** - Deteccao por regras, mensagens por templates/IA
6. **UUID validation obrigatorio** - Sempre validar antes de queries
7. **Rate limiting em API routes** - Usar `@/lib/rate-limit`
8. **Focus trap em modais** - Usar `useFocusTrap` para acessibilidade

---

## Seguranca e Compliance

### Utilitarios Disponiveis
- `validateUUID(id)` - Validacao de UUID (lib/schemas/uuid.ts)
- `rateLimitMiddleware(req, config)` - Rate limiting (lib/rate-limit.ts)
- `useFocusTrap(isOpen)` - Focus trap para modais (hooks/use-focus-trap.ts)
- `CookieConsentBanner` - Banner de cookies LGPD (components/cookie-consent-banner.tsx)
- `getAuthenticatedUser()` - Helper de autenticacao (lib/supabase/server.ts)
- `logger` - Logging estruturado (lib/logger.ts) - USAR em vez de console.log/error
- `ErrorBoundary` - Captura erros de React (components/error-boundary.tsx)
- `trackAIUsage()` - Rastrear uso de tokens de IA (lib/ai/usage-tracker.ts)

### Paginas Legais
- `/privacidade` - Politica de Privacidade
- `/termos` - Termos de Uso

### react-markdown
IMPORTANTE: v9+ nao aceita `className`. Usar wrapper div:
```typescript
<div className="prose"><ReactMarkdown>{content}</ReactMarkdown></div>
```

### Componentes Utilitarios
- `BottomSheet` - Modal mobile-friendly com drag-to-close (components/bottom-sheet.tsx)
- `ActionBar` - Barra de acoes responsiva: dropdown no desktop, bottom bar no mobile (aplicacoes/[id]/action-bar.tsx)

### Animacoes
- `animate-fade-up` - Fade + slide up (Tailwind config)
- `fadeUp` keyframe em globals.css (para inline styles)

---

## Plans em Progresso

Ver `.cursor/plans/` para planos detalhados:

- `contextualizacao_entrevista_*.plan.md` - Escolher contexto antes de entrevista
- `lp_copilot_showcase_*.plan.md` - Showcase animado na LP
- `email_otp_authentication_*.plan.md` - Login via codigo OTP

---

## Common Tasks

### Adicionar novo limite de subscription
1. Adicionar constante em `lib/subscription/limits.ts`
2. Adicionar coluna em `user_profiles` (migration)
3. Criar `canUseX()` em `check-access.ts`
4. Criar `incrementXUsage()` em `actions.ts`

### Adicionar contexto ao Copilot
1. Adicionar tipo em `hooks/use-copilot-drawer.ts`
2. Adicionar mensagem inicial em `copilot-chat/insight-messages.ts`
3. Adicionar perguntas sugeridas em `copilot-chat/suggested-questions.tsx`
4. Atualizar `buildSystemPrompt()` em `lib/copilot/context-builder.ts`

### Adicionar contexto ao Hero Card
1. Adicionar tipo em `lib/hero/types.ts`
2. Adicionar deteccao em `lib/hero/detect-context.ts`
3. Adicionar template/prompt em `lib/hero/build-message.ts`

### Criar nova feature com limite
1. Criar migration para contador
2. Criar funcao de verificacao
3. Criar funcao de incremento
4. Usar em Server Component/Action
5. Mostrar `UpgradePrompt` quando limite atingido

---

## Como Abrir Novo Chat

```
Estou trabalhando no GoHire Copilot.
Leia AGENTS.md e as rules em .cursor/rules/ para contexto.
Objetivo: [descreva brevemente]
```

Se houver plano:
```
Execute o plano em .cursor/plans/[nome].plan.md
```
