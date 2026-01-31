---
name: Correções Críticas
overview: Corrigir os itens críticos de LGPD, Segurança, SEO e Acessibilidade que são bloqueadores para lançamento público no Brasil.
todos:
  - id: lgpd-privacy
    content: Criar página /privacidade com Política de Privacidade
    status: pending
  - id: lgpd-terms
    content: Criar página /termos com Termos de Uso
    status: pending
  - id: lgpd-cookies
    content: Implementar banner de consentimento de cookies
    status: pending
  - id: sec-xss
    content: Corrigir XSS substituindo dangerouslySetInnerHTML por react-markdown
    status: pending
  - id: sec-uuid
    content: Adicionar validação UUID com Zod em todas as queries
    status: pending
  - id: sec-ratelimit
    content: Implementar rate limiting nas API routes
    status: pending
  - id: seo-robots
    content: Criar robots.ts para gerar robots.txt
    status: pending
  - id: seo-sitemap
    content: Criar sitemap.ts para gerar sitemap.xml
    status: pending
  - id: seo-og
    content: Adicionar Open Graph e Twitter Cards no layout
    status: pending
  - id: seo-noindex
    content: Adicionar noindex no dashboard layout
    status: pending
  - id: a11y-focustrap
    content: Criar hook useFocusTrap e aplicar em todos os modais
    status: pending
isProject: false
---

# Plano: Correções Críticas

Este plano cobre os itens que devem ser resolvidos **antes do lançamento público**, organizados por área.

---

## 1. LGPD - Compliance Legal

### 1.1 Criar Política de Privacidade

- Criar página `/privacidade` com:
  - Dados coletados e finalidade
  - Base legal (consentimento, execução de contrato)
  - Terceiros (OpenAI, Stripe, PostHog, GA)
  - Direitos do titular
  - Contato do encarregado
- Atualizar links no footer da LP que apontam para `#`

### 1.2 Criar Termos de Uso

- Criar página `/termos` com:
  - Condições de uso do serviço
  - Limitações de responsabilidade
  - Uso de IA (aviso importante)
- Atualizar links no footer

### 1.3 Banner de Cookies

- Implementar banner de consentimento
- Carregar PostHog/GA somente após consentimento
- Salvar preferência em cookie/localStorage
- Usar biblioteca como `react-cookie-consent` ou implementar manualmente

---

## 2. Segurança

### 2.1 Corrigir XSS (dangerouslySetInnerHTML)

- Arquivo: `apps/web/src/app/dashboard/_components/copilot-chat/chat-messages.tsx`
- Problema: `dangerouslySetInnerHTML` com `formatMarkdown` sem sanitização
- Solução: Instalar `react-markdown` e substituir implementação atual

```typescript
// Antes (inseguro)
<div dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />

// Depois (seguro)
import ReactMarkdown from 'react-markdown'
<ReactMarkdown className="prose prose-sm">{message.content}</ReactMarkdown>
```

### 2.2 Validação UUID em Queries

- Arquivos afetados:
  - `apps/web/src/app/dashboard/aplicacoes/actions.ts` (getApplication, getStatusHistory)
  - `apps/web/src/app/dashboard/interview-pro/actions.ts` (submitAnswer, abandonSession)
  - `apps/web/src/app/dashboard/insights/[id]/page.tsx` (getInsight)
- Solução: Criar schema Zod e validar antes da query

```typescript
import { z } from 'zod'
const uuidSchema = z.string().uuid()

export async function getApplication(id: string) {
  const validated = uuidSchema.safeParse(id)
  if (!validated.success) {
    return { error: 'ID inválido', data: null }
  }
  // ... resto do código
}
```

### 2.3 Rate Limiting nas API Routes

- Arquivos afetados:
  - `apps/web/src/app/api/chat/route.ts`
  - `apps/web/src/app/api/coupon/validate/route.ts`
  - `apps/web/src/app/api/coupon/apply/route.ts`
- Solução: Usar `@upstash/ratelimit` ou implementar manualmente com headers

```typescript
// Opção simples sem dependência externa
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) return false
  record.count++
  return true
}
```

---

## 3. SEO

### 3.1 Criar robots.txt

- Criar arquivo `apps/web/src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/', '/api/', '/insight'],
    },
    sitemap: 'https://copilot.gohire.work/sitemap.xml',
  }
}
```

### 3.2 Criar sitemap.xml

- Criar arquivo `apps/web/src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://copilot.gohire.work'
  
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/comecar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ]
}
```

### 3.3 Adicionar Open Graph Tags

- Atualizar `apps/web/src/app/layout.tsx` com metadata completa
- Criar imagem OG em `public/og-image.png` (1200x630px)

```typescript
export const metadata: Metadata = {
  title: 'GoHire Copilot | Decisões de carreira com clareza',
  description: 'Responda algumas perguntas e receba um direcionamento personalizado...',
  openGraph: {
    title: 'GoHire Copilot | Decisões de carreira com clareza',
    description: 'Responda algumas perguntas e receba um direcionamento personalizado...',
    url: 'https://copilot.gohire.work',
    siteName: 'GoHire Copilot',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GoHire Copilot' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoHire Copilot | Decisões de carreira com clareza',
    description: 'Responda algumas perguntas e receba um direcionamento personalizado...',
    images: ['/og-image.png'],
  },
}
```

### 3.4 Adicionar noindex em páginas privadas

- Atualizar `apps/web/src/app/dashboard/layout.tsx`

```typescript
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
```

---

## 4. Acessibilidade (Crítico)

### 4.1 Focus Trap em Modais

- Arquivos afetados:
  - `apps/web/src/app/dashboard/aplicacoes/_components/change-status-modal.tsx`
  - `apps/web/src/app/dashboard/aplicacoes/_components/delete-confirm-modal.tsx`
  - `apps/web/src/app/insight/signup-modal.tsx`
  - `apps/web/src/app/dashboard/_components/copilot-chat/copilot-drawer.tsx`
- Solução: Criar hook `useFocusTrap` reutilizável

```typescript
// hooks/use-focus-trap.ts
import { useEffect, useRef } from 'react'

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    
    previousActiveElement.current = document.activeElement as HTMLElement
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  return containerRef
}
```

- Adicionar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` nos modais

---

## Ordem de Execução Sugerida

1. **LGPD 1.1** - Política de Privacidade
2. **LGPD 1.2** - Termos de Uso
3. **LGPD 1.3** - Banner de Cookies
4. **Segurança 2.1** - Corrigir XSS
5. **Segurança 2.2** - Validação UUID
6. **Segurança 2.3** - Rate Limiting
7. **SEO 3.1** - robots.txt
8. **SEO 3.2** - sitemap.xml
9. **SEO 3.3** - Open Graph
10. **SEO 3.4** - noindex dashboard
11. **Acessibilidade 4.1** - Focus Trap

---

## Dependências a Instalar

```bash
npm install react-markdown react-cookie-consent
```

Opcionais (se preferir rate limiting robusto):

```bash
npm install @upstash/ratelimit @upstash/redis
```

