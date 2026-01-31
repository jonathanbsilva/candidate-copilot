# GoHire Copilot - Project Rules

## Idioma
- Responder em Portugues (pt-BR)
- Codigo e comentarios em Portugues
- UI text em Portugues

## Antes de Codar

1. Ler `AGENTS.md` para arquitetura
2. Verificar `.cursor/plans/` para planos existentes
3. Verificar rules relacionadas ao topico

## Rules Disponiveis

| Arquivo | Conteudo |
|---------|----------|
| `product.md` | North Star, Product Truths, Planos |
| `ux.md` | UX Skills, Copy, Tom, Estados |
| `design.md` | Paleta, Componentes, Spacing |
| `ai.md` | Postura Copilot, Guardrails, Formatos |
| `engineering.md` | Stack, Arquitetura, Padroes |
| `patterns.md` | Code snippets reutilizaveis |
| `workflow.md` | DoD, PRs, Commits |

## Nao Fazer

- Criar API routes sem necessidade (usar Server Actions)
- Adicionar dependencias sem verificar se existe similar
- Usar `any` type
- Commitar `.env`
- Responder em ingles (a menos que pedido)
- Criar features que nao conectam com o Copilot
- Ignorar mobile

## Sempre Fazer

- Usar `@ui/components` para primitivos
- Verificar limites de subscription antes de features Pro
- Testar no mobile
- Incluir estados (loading, empty, error)
- Manter copy em pt-BR
