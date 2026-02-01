# GoHire Copilot (Candidate Copilot)

Copilot de carreira que ajuda profissionais a tomar decisões de emprego com clareza.

**North Star**: Clareza para decisões de carreira (não "um tracker de vagas").

---

## Quick Start

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

```bash
# Lint
npm run lint

# Build
npm run build
```

---

## Pré-requisitos

- **Node.js** 18+
- **Supabase** – projeto em [supabase.com](https://supabase.com) (Postgres, Auth, RLS)
- **Variáveis de ambiente** – copie `apps/web/.env.example` para `apps/web/.env.local` e preencha

Principais variáveis:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (dashboard do projeto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (chave service role) |
| `OPENAI_API_KEY` | OpenAI (para Copilot e Entrevista IA) |
| `STRIPE_*` | Stripe (pagamentos Pro) |
| `NEXT_PUBLIC_APP_URL` | URL da app (ex.: `http://localhost:3000`) |

Para desenvolvimento local com Supabase: migrations em `supabase/migrations/`; rodar com `supabase start`.

---

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict) |
| UI | TailwindCSS + shadcn/ui (`packages/ui`) |
| Banco | Supabase (Postgres + Auth + RLS) |
| IA | OpenAI (gpt-4o-mini) |
| Pagamentos | Stripe |
| Analytics | PostHog + Google Analytics 4 |
| Estado | Zustand (client), Server Actions (mutations) |

---

## Estrutura do Projeto

```
apps/web/          # App Next.js (dashboard, auth, comecar, insight)
packages/
  ui/              # Design system (Button, Card, etc.)
  lib/             # Utilitários compartilhados
supabase/
  migrations/      # Migrations Postgres
docs/              # ROADMAP, decisões
.cursor/rules/     # Regras de produto, UX, engenharia
```

---

## Funcionalidades

- **Entry flow** – 3 perguntas sem cadastro → primeiro insight; opção de criar conta para salvar
- **Tracking de vagas** – CRUD de candidaturas, timeline de status, métricas
- **Copilot** – Chat contextual (insight, hero card, feedback de entrevista); Free 5/dia, Pro ilimitado
- **Entrevista IA** – Mock interviews em texto; Free 1 trial vitalício, Pro ilimitado
- **Hero Card** – Card adaptativo no dashboard (proposta, entrevista, follow-up)
- **Planos** – Free (limites mensais) e Pro (R$ 19/mês via Stripe)

---

## Documentação

- **Roadmap e produto**: `docs/ROADMAP.md`
- **Decisões**: `docs/decisions/`
- **Para contribuir / agentes**: `AGENTS.md` e regras em `.cursor/rules/`

---

## Licença

Privado – GoHire.
