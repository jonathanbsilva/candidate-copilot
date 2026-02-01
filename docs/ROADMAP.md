# Roadmap — GoHire Copilot

> **Fonte unica de verdade** para discussoes de produto, backlog e futuro.
> Atualizado: Jan/2026

---

## Principios

- **Clareza para decisoes de carreira** (nao "um tracker de vagas")
- **Low friction**: menor atrito possivel para valor
- **Progressive disclosure**: revelar complexidade gradualmente
- **Copilot-centric**: features alimentam o Copilot com contexto

---

## Now (Em Execucao / Curto Prazo)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Perfil/CV do Candidato** | Upload de CV (PDF), parse/extracao de dados, armazenamento estruturado, edicao manual | Pendente | `perfil_cv_candidato_*.plan.md` (a criar) |
| **Contextualizacao de Entrevista** | Selecionar contexto (vaga cadastrada, ultimo insight, manual) antes de iniciar sessao | Pendente | `contextualizacao_entrevista_*.plan.md` (a criar) |
| **Copilot Showcase na LP** | Secao com exemplos visuais/animados do Copilot na landing page | Pendente | `lp_copilot_showcase_*.plan.md` (a criar) |
| **Auth Email OTP (default)** | Email OTP como padrao, Magic Link como secundario (reduz friccao) | Pendente | `email_otp_authentication_*.plan.md` (a criar) |

---

## Next (1-2 Sprints)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Indices de DB** | Adicionar indices para queries frequentes | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **RPC Increment Atomico** | Usar RPC para incrementos atomicos (evitar race conditions) | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **Fix/Limit Benchmark** | Corrigir e limitar funcao de benchmark | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **Bundle Analyzer + Lazy Load** | Otimizar bundle e lazy load de componentes pesados | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |

---

## Later (Medio Prazo)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Componentizacao/Design System** | Tokens, Modal, EmptyState, Skeleton, refactors de cores | Pendente | `.cursor/plans/refactory_componentização_design_system_0e0bf98b.plan.md` |
| **Media/Baixa Prioridade Refactors** | Memoizacao, logger, a11y/seo, otimizacoes de IA | Pendente | `.cursor/plans/refactory_média_baixa_prioridade_66c4af49.plan.md` |

---

## Parking Lot (Ideias Discutidas, Sem Compromisso)

### Alta Prioridade (valor de produto)

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Match Score CV ↔ Vaga** | Usuario entende gap entre CV e vaga; "why you didnt get called" | Perfil/CV do Candidato (Now) | Outputs: score, top 5 motivos, sugestoes (CV, projetos, cursos) |
| **Integracao ATS** | Sync automatico de status de vagas | Provedores externos, permissoes | Complexo; depende de discovery de provedores |
| **Career Coach IA** | Evolucao do Copilot para conselheiro estrategico | Historico de apps + entrevistas + CV | Feature grande; depende de Match Score |

### Media Prioridade

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Blog / SEO** | Trafego organico qualificado; conteudo sobre entrevistas, carreira, negociacao | Decisao: construir no Next.js ou integrar (Ghost, Notion, etc.) | Alimenta entry flow; custo baixo, resultado a medio prazo |
| **Notificacoes/Alertas** | Follow-up, entrevista, prazo | - | Push ou email |
| **Metas/Gamificacao** | Engajamento (streaks, badges) | - | Validar se faz sentido pro produto |
| **Helper/Onboarding** | Tour guiado para novos usuarios | - | - |

### Baixa Prioridade / V1+

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Analytics Avancado** | Metricas mais detalhadas | - | - |
| **Auto-Apply** | Aplicar automaticamente em vagas | Integracao ATS | Complexo |
| **CV Builder Completo** | Criar CV dentro do produto | - | Scope grande |

---

## Segundo Produto: Portal de Vagas + Lado Empresa

> Ideia em exploracao: empresas publicam vagas no GoHire; candidatos aplicam pelo nosso portal. Dados nossos permitem Match Score, comparacao com outros candidatos e monetizacao B2B. Requer dashboard e fluxos para o persona "empresa".

### Visao

- **Empresas** criam conta, publicam vagas e gerenciam candidaturas em um dashboard dedicado.
- **Candidatos** veem vagas no portal GoHire, se candidatam e recebem Match Score (CV vs vaga) e, quando possivel, comparacao com outros candidatos na vaga.
- **GoHire** monetiza cobrando da empresa (publicacao, destaque, pacotes) e mantem o diferencial em clareza para decisoes (Match Score, Copilot, Career Coach).

### Fases / MVP sugerido

| Fase | Escopo | Notas |
|------|--------|-------|
| **0. Discovery** | Validar interesse de empresas (parcerias piloto, entrevistas) | Evitar construir antes de validar demanda |
| **1. MVP Portal** | Empresas publicam vagas; candidatos listam e se candidatam; empresa ve lista de candidatos | Sem cobranca ainda; foco em fluxo minimo |
| **2. Match Score** | Score CV x vaga + top 5 motivos + sugestoes | Depende de Perfil/CV do Candidato (Now) |
| **3. Comparacao** | Candidato ve como se posiciona vs outros na vaga (ex.: "top 20%") | Dados nossos; cuidado com privacidade e UX |
| **4. Monetizacao** | Planos para empresa (vagas incluidas, destaque, etc.) | Definir precificacao e limites free |

### Dependencias

- **Produto**: Dashboard empresa (auth, CRUD vagas, gestao de candidaturas, notificacoes).
- **Produto**: Perfil/CV do Candidato (Now) — base para Match Score e comparacao.
- **Go-to-market**: Estrategia para atrair empresas e candidatos (nicho, parcerias, free tier).

### Riscos / Notas

- **Scope**: Segundo persona = segundo produto; nao e "uma feature".
- **Ovo e galinha**: Empresas precisam de candidatos; candidatos de vagas. Considerar lancamento por nicho ou com parceiros.
- **Concorrencia**: Gupy, Vagas.com, LinkedIn; precisamos de razao clara para empresa publicar no GoHire (ex.: candidatos mais preparados, Match Score, Copilot).

### Status

- **Parking Lot** — sem compromisso de data; secao existe para manter a ideia quebrada e alinhada ao north star.

---

## Growth: Aquisicao de Candidatos

> Objetivo: construir base de candidatos qualificados (meta: 10k+) antes de lancar o lado empresa. Com base solida, pitch pra empresas fica forte ("temos X mil candidatos preparados").

### Por Que Candidatos Primeiro

- **Produto standalone**: candidato ja recebe valor (insight, Entrevista IA, Copilot) sem precisar de vagas de empresa.
- **Pitch B2B**: "temos 10k candidatos que praticam entrevistas e recebem insights de carreira" e mais convincente que "temos plataforma nova".
- **Dados para Match Score**: quanto mais candidatos com perfil/CV, melhor o score e a comparacao.

### Estrategias

| Estrategia | Descricao | Custo | Tempo | Prioridade |
|------------|-----------|-------|-------|------------|
| **Entry flow + Share** | Otimizar conversao do entry flow; facilitar compartilhamento de insight | Baixo | Rapido | Alta |
| **Parcerias (bootcamps, universidades)** | Oferecer acesso a alunos em transicao de carreira; co-marketing | Baixo | Medio | Alta |
| **Ads (Meta, Google, TikTok)** | Campanhas pagas com funil: ad → entry flow → insight → signup | Medio–alto | Rapido | Media (testar CAC) |
| **SEO / Blog** | Conteudo sobre entrevistas, carreira, negociacao; trafego organico | Baixo | Lento | Media |
| **Social organico (TikTok, Reels, LinkedIn)** | Videos curtos com dicas de carreira; posts no LinkedIn | Baixo | Medio | Media |
| **Referral / Gamificacao** | Candidato convida amigos; recompensas ou badges | Medio | Medio | Baixa (apos validar retencao) |
| **Comunidades (Reddit, Discord, Telegram)** | Participar de grupos de vagas/tech oferecendo valor | Baixo | Medio | Baixa |
| **PR / Midia** | Cobertura em blogs de carreira, tech, startups | Baixo | Variavel | Oportunistica |

### Acoes Sugeridas (Curto Prazo)

1. **Garantir share de insight**: resultado bonito (Open Graph), facil de compartilhar.
2. **Mapear bootcamps/universidades**: listar parceiros potenciais, propor piloto.
3. **Testar ads com budget pequeno**: validar CAC antes de escalar.
4. **Criar 2-3 posts de blog**: SEO para termos de alta intencao ("como se preparar para entrevista").

### Metricas a Acompanhar

- **Usuarios cadastrados** (meta: 10k)
- **Taxa de conversao entry flow → signup**
- **CAC** (custo de aquisicao por canal)
- **Retencao** (usuarios que voltam em 7/30 dias)
- **Shares** (quantos insights compartilhados)

### Status

- **Em exploracao** — definir acoes concretas e metas antes de executar.

---

## Dependencias / Sequencia Sugerida

```
1. Fundacao: Perfil/CV do Candidato (desbloqueia Match Score, Copilot contextual, comparacao)
   ↓
2. Conversao/Ativacao: OTP + Showcase + Contextualizacao de Entrevista
   ↓
3. Estabilidade: Indices DB + RPC Increment (escala + race conditions)
   ↓
4. Manutencao: Componentizacao (reduz custo de novas features)
   ↓
5. Features Grandes: Match Score → ATS → Career Coach
```

---

## Estado Atual (Ja Entregue)

### Produto (MVP)
- Landing + Entry flow (insight sem cadastro)
- Tracking de candidaturas (CRUD + timeline)
- Copilot contextual (insight/hero/interview)
- Entrevista IA funcional + trial (1 free)
- Assinatura Free/Pro (Stripe)
- Analytics basico (PostHog + GA4)

### Estabilidade (Refactors Completos)
- Correcoes criticas: LGPD/Seguranca/SEO/A11y — `.cursor/plans/refactory_correções_críticas_0efeb8d2.plan.md` ✅
- Alta prioridade: performance/estado/observabilidade — `.cursor/plans/refactory_alta_prioridade_82b3adfb.plan.md` ✅

---

## Links para Planos

| Plano | Status |
|-------|--------|
| `refactory_correções_críticas_0efeb8d2.plan.md` | ✅ Completo |
| `refactory_alta_prioridade_82b3adfb.plan.md` | ✅ Completo |
| `refactory_infraestrutura_otimização_95e0dc24.plan.md` | ⏳ Pendente |
| `refactory_componentização_design_system_0e0bf98b.plan.md` | ⏳ Pendente |
| `refactory_média_baixa_prioridade_66c4af49.plan.md` | ⏳ Pendente |

---

## Como Atualizar Este Documento

Ao discutir ideias de produto:
1. Registrar a ideia na secao apropriada (Now/Next/Later/Parking Lot)
2. Documentar: **por que importa** + **dependencias** + **notas**
3. Se criar plano de execucao, adicionar link na coluna "Plano/Link"
4. Ao completar item, mover para "Estado Atual" com ✅
