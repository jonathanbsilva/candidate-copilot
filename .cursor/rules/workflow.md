# Workflow Rules - GoHire Copilot

## Definition of Done (DoD)

Uma feature so esta pronta quando:
- [ ] Entrega valor claro ao usuario (nao so UI)
- [ ] Sem travar fluxo por IA (fallbacks)
- [ ] Tem estados: loading, empty, error, success
- [ ] Acessivel (labels, focus, contraste)
- [ ] Mobile ok
- [ ] Copy final pt-BR

## Checklist Pre-Commit

- [ ] `npm run lint` passa
- [ ] Testado no mobile
- [ ] Copy revisada (pt-BR)
- [ ] Sem regressao no "wow moment"
- [ ] Types corretos (sem `any`)

## Padroes de PR

### Tamanho
- PR pequeno e revisavel
- Uma feature/fix por PR

### Descricao
```markdown
## O que muda
[Descricao curta]

## Screenshot/Video
[Anexar visual]

## Checklist
- [ ] Testado mobile
- [ ] Copy pt-BR
- [ ] Sem regressoes
```

## Decisions Log

Toda decisao importante vira doc em `/docs/decisions/`:
- Formato: `YYYY-MM-DD-descricao.md`
- Conteudo: Contexto, Opcoes, Decisao, Consequencias

Exemplos:
- `2026-01-29-auth-supabase.md`
- `2026-01-30-interview-trial.md`

## Plans

Planos de features em `.cursor/plans/`:
- Criados pelo agente via `CreatePlan`
- Atualizados conforme execucao
- Marcados como completed quando finalizados

## Branches

- `main` - producao
- `feat/xxx` - features
- `fix/xxx` - bug fixes
- `chore/xxx` - manutencao

## Commits

Formato: `tipo: descricao curta`

Tipos:
- `feat:` nova feature
- `fix:` bug fix
- `refactor:` refatoracao
- `style:` estilo (CSS, formatacao)
- `docs:` documentacao
- `chore:` manutencao
