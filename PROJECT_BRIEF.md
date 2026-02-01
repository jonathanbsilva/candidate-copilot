# GoHire Copilot - Project Brief

## O que e
Copilot de carreira que ajuda profissionais a tomar decisoes de emprego com clareza.

**North Star**: Clareza para decisoes de carreira (nao "um tracker de vagas")

---

## Status Atual

### MVP Completo
- Entry flow → Insights de carreira (sem cadastro)
- Tracking de candidaturas (CRUD + timeline)
- Copilot chat contextual
- Entrevista IA (mock interviews com IA)
- Hero Card adaptativo
- Planos Free/Pro com Stripe
- Analytics (PostHog + GA4)

### Limites Free
- 3 insights/mes
- 5 candidaturas/mes
- 5 perguntas/dia Copilot
- 1 entrevista simulada (trial vitalicio)

---

## Proximos Objetivos

### 1. Contextualizacao de Entrevista
**Plano**: `.cursor/plans/contextualizacao_entrevista_*.plan.md`

Permitir usuario escolher contexto antes de iniciar entrevista:
- Vaga cadastrada (das candidaturas)
- Ultimo insight
- Manual

### 2. Copilot Showcase na LP
**Plano**: `.cursor/plans/lp_copilot_showcase_*.plan.md`

Secao animada na landing page mostrando o Copilot em acao com exemplos de conversas.

### 3. Email OTP Login
**Plano**: `.cursor/plans/email_otp_authentication_*.plan.md`

Login via codigo de 6 digitos (padrao), Magic Link como secundario.

---

## Ideas de Produto (Parking Lot)

Fonte: `docs/ROADMAP.md`. Criterio de fit: gera clareza, alimenta o Copilot, CTA para Candidaturas/Entrevista IA/Copilot.

**Alta prioridade (valor de produto)**  
Match Score CV ↔ Vaga, Checklist de Decisao (aceitar oferta), Comparar Ofertas (2–3 ofertas), Perguntas que vou ouvir (por vaga/cargo), Integracao ATS, Career Coach IA.

**Media prioridade**  
Notificacoes/Alertas (follow-up, entrevista, prazo), Um passo por vez (acao sugerida por dia/semana), Diario de carreira (micro), Blog/SEO, Metas/Gamificacao (validar), Helper/Onboarding.

**Priorizacao sugerida**: Perfil/CV → Notificacoes → Checklist ou Comparar Ofertas → Perguntas que vou ouvir → Match Score.

**Evitar**: Tracking sem conexao com decisao/Copilot; gamificacao pesada sem "proximo passo"; CV builder completo como escopo dentro do app.

---

## Tech Stack Resumido

- Next.js 14 (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Supabase (Postgres + Auth + RLS)
- OpenAI (gpt-4o-mini)
- Stripe + PostHog + GA4

---

## Arquivos Importantes

| Arquivo | Descricao |
|---------|-----------|
| `AGENTS.md` | Guia operacional completo |
| `.cursor/rules/` | Regras automaticas do Cursor |
| `.cursor/plans/` | Planos de features |
| `lib/subscription/` | Controle de acesso e limites |
| `lib/copilot/` | Logica do chat |
| `lib/hero/` | Hero Card adaptativo |

---

## Como Comecar Novo Chat

### Basico
```
Estou trabalhando no GoHire Copilot.
Leia AGENTS.md para contexto.
Objetivo: [descreva]
```

### Com plano existente
```
Continuando GoHire Copilot.
Execute o plano: .cursor/plans/[nome].plan.md
```

### Continuacao
```
Continuando GoHire Copilot.
Leia AGENTS.md e PROJECT_BRIEF.md.
Ultimo feito: [X]
Proximo: [Y]
```
