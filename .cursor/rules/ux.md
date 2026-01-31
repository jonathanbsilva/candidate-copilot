# UX Rules - GoHire Copilot

## Regras de UX (MVP)

### Principios
- **Sem friccao**: valor antes de pedir cadastro
- **Sem "coach generico"**: respostas sempre baseadas em contexto/dados
- **Sem "IA intrusiva"**: IA sugere, nao sobrescreve
- **Progressive disclosure**: primeiro Copilot, depois tracking, depois entrevistas

### Fluxo de Valor
```
Insight gratuito → Conta opcional → Tracking → Interview Pro
```

## Copy & Tone (pt-BR)

### Linguagem
- Direta, humana, sem startupês
- "Decisao" > "otimizacao"
- Evitar termos de RH corporativo

### Exemplos

**Bom:**
- "Leva menos de 2 minutos"
- "Com base no seu contexto"
- "Clareza para sua decisao"
- "Vamos analisar juntos?"

**Ruim:**
- "Aumente sua empregabilidade com IA"
- "Otimize sua jornada profissional"
- "Revolucione sua carreira"
- "Pipeline de oportunidades"

## Estados Obrigatorios

Toda interface deve ter:
- Loading state (skeleton ou spinner)
- Empty state (mensagem + CTA)
- Error state (mensagem clara + retry)
- Success state (feedback visual)

## Mobile First
- Testar sempre no mobile primeiro
- Layouts devem empilhar verticalmente em telas pequenas
- Touch targets minimo 44x44px
- Evitar hover-only interactions

## Acessibilidade Basica
- Labels em todos os inputs
- Focus visivel
- Contraste adequado (WCAG AA)
- Textos alternativos em imagens
