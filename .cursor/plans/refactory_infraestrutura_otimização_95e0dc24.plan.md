---
name: Infraestrutura Otimização
overview: Otimizações de bundle size para melhor performance de carregamento e melhorias no banco de dados para queries mais rápidas.
todos:
  - id: bundle-analyzer
    content: Instalar e configurar @next/bundle-analyzer
    status: pending
  - id: lazy-posthog
    content: Lazy load do PostHogProvider no layout
    status: pending
  - id: lazy-showcase
    content: Lazy load do CopilotShowcase na home
    status: pending
  - id: lazy-modals
    content: Dynamic import dos modais (Delete, ChangeStatus, Signup)
    status: pending
  - id: db-indexes
    content: Criar migration com índices de performance
    status: pending
  - id: db-rpc-increment
    content: Criar função RPC para incrementos atômicos
    status: pending
  - id: db-benchmark
    content: Corrigir getBenchmarkMetrics (adicionar LIMIT ou RPC)
    status: pending
  - id: db-waitlist
    content: Restringir policy RLS da waitlist
    status: pending
  - id: query-limit
    content: Adicionar LIMIT em queries sem limite
    status: pending
isProject: false
---

# Plano: Infraestrutura e Otimização

Este plano cobre otimizações de bundle e database que melhoram a performance geral do sistema.

---

## 1. Bundle Size (Redução estimada: ~280KB)

### 1.1 Adicionar Bundle Analyzer

**Instalar:**
```bash
npm install -D @next/bundle-analyzer
```

**Atualizar:** `apps/web/next.config.js`

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  transpilePackages: ['@ui/components'],
})
```

**Adicionar script:** `package.json`
```json
"scripts": {
  "analyze": "ANALYZE=true npm run build"
}
```

### 1.2 Lazy Load do PostHogProvider (Alto Impacto)

**Arquivo:** `apps/web/src/app/layout.tsx`

```typescript
import dynamic from 'next/dynamic'

const PostHogProvider = dynamic(
  () => import('@/components/providers/posthog-provider').then(m => ({ default: m.PostHogProvider })),
  { ssr: false }
)
```

**Redução estimada:** ~200KB no bundle inicial

### 1.3 Lazy Load do CopilotShowcase (Médio Impacto)

**Arquivo:** `apps/web/src/app/page.tsx`

```typescript
import dynamic from 'next/dynamic'

const CopilotShowcase = dynamic(
  () => import('./_components/copilot-showcase').then(m => ({ default: m.CopilotShowcase })),
  { loading: () => <div className="h-96 animate-pulse bg-stone/10 rounded-lg" /> }
)
```

**Redução estimada:** ~15KB no bundle inicial

### 1.4 Dynamic Import de Modais (Médio Impacto)

**Padrão para modais:**

```typescript
// Em vez de import estático
import { DeleteConfirmModal } from './delete-confirm-modal'

// Usar dynamic import
const DeleteConfirmModal = dynamic(
  () => import('./delete-confirm-modal').then(m => ({ default: m.DeleteConfirmModal })),
  { ssr: false }
)
```

**Arquivos afetados:**
- `apps/web/src/app/dashboard/aplicacoes/[id]/page.tsx` (DeleteConfirmModal)
- `apps/web/src/app/dashboard/aplicacoes/[id]/page.tsx` (ChangeStatusModal)
- `apps/web/src/app/insight/page.tsx` (SignupModal)

**Redução estimada:** ~10KB por modal

---

## 2. Database - Índices (Crítico)

### 2.1 Migration para Índices de Performance

**Criar:** `supabase/migrations/XXX_add_performance_indexes.sql`

```sql
-- Índices compostos para queries frequentes

-- Applications: filtro por user + status (usado em listagens filtradas)
CREATE INDEX IF NOT EXISTS idx_applications_user_status 
  ON applications(user_id, status);

-- Applications: filtro por user + ordenação por updated_at (usado no Hero Card)
CREATE INDEX IF NOT EXISTS idx_applications_user_updated 
  ON applications(user_id, updated_at DESC);

-- Interview Sessions: filtro por user + status + ordenação (usado em histórico)
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_status_completed 
  ON interview_sessions(user_id, status, completed_at DESC);

-- Insights: filtro por user + ordenação (usado em listagem e contexto)
CREATE INDEX IF NOT EXISTS idx_insights_user_created 
  ON insights(user_id, created_at DESC);

-- Status History: filtro por application + ordenação (usado na timeline)
CREATE INDEX IF NOT EXISTS idx_status_history_app_changed 
  ON status_history(application_id, changed_at DESC);

-- User Profiles: busca por Stripe customer (usado em webhooks)
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer 
  ON user_profiles(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Coupons: busca por código ativo (usado na validação)
CREATE INDEX IF NOT EXISTS idx_coupons_code_active 
  ON coupons(code, is_active) 
  WHERE is_active = true;
```

---

## 3. Database - Queries Problemáticas

### 3.1 Corrigir getBenchmarkMetrics (Crítico)

**Arquivo:** `apps/web/src/app/dashboard/actions.ts`

**Problema:** Busca TODAS as aplicações de TODOS os usuários sem LIMIT.

**Solução 1:** Adicionar LIMIT para amostra estatística
```typescript
const { data: allApps } = await supabase
  .from('applications')
  .select('user_id, status')
  .limit(10000) // Amostra suficiente para estatísticas
```

**Solução 2 (melhor):** Usar função RPC no banco
```sql
-- Criar função para métricas agregadas
CREATE OR REPLACE FUNCTION get_benchmark_metrics()
RETURNS TABLE (
  total_users BIGINT,
  total_applications BIGINT,
  avg_apps_per_user NUMERIC,
  status_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT user_id)::BIGINT,
    COUNT(*)::BIGINT,
    ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2),
    jsonb_object_agg(status, count) 
  FROM (
    SELECT status, COUNT(*) as count 
    FROM applications 
    GROUP BY status
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Otimizar Incrementos de Uso

**Arquivos:** `apps/web/src/lib/subscription/actions.ts`

**Problema:** SELECT seguido de UPDATE (race condition possível)

**Antes:**
```typescript
// Busca o valor atual
const { data: profile } = await supabase.from('user_profiles').select('insights_used_this_month')
// Incrementa manualmente
await supabase.from('user_profiles').update({ insights_used_this_month: profile.insights_used_this_month + 1 })
```

**Depois:**
```typescript
// Incremento atômico usando RPC
const { error } = await supabase.rpc('increment_usage', {
  p_user_id: userId,
  p_field: 'insights_used_this_month'
})
```

**Criar função RPC:**
```sql
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_field TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE user_profiles SET %I = COALESCE(%I, 0) + 1 WHERE user_id = $1',
    p_field, p_field
  ) USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 Adicionar LIMIT em Queries Sem Limite

**getUserContext:**
```typescript
// Applications
.select('...').limit(50)

// Insights
.select('...').limit(20)

// Interview Sessions
.select('...').limit(10)
```

**getApplications:**
```typescript
.select('...').limit(100) // ou implementar paginação
```

---

## 4. Database - RLS Optimization

### 4.1 Restringir Policy da Waitlist

**Problema:** Qualquer usuário autenticado pode ver toda a waitlist.

```sql
-- Antes
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT TO authenticated USING (true);

-- Depois (apenas o próprio email)
DROP POLICY IF EXISTS "Allow authenticated reads" ON waitlist;
CREATE POLICY "Users can view own waitlist entry" ON waitlist
  FOR SELECT TO authenticated 
  USING (email = auth.jwt()->>'email');
```

---

## 5. Resumo das Otimizações

### Bundle Size
| Otimização | Redução Estimada |
|------------|------------------|
| Lazy load PostHogProvider | ~200KB |
| Lazy load CopilotShowcase | ~15KB |
| Dynamic import modais | ~30KB |
| **Total** | **~245KB** |

> **Nota:** Lazy load do CopilotDrawer está no Plano de Alta Prioridade.

### Database Performance
| Otimização | Impacto |
|------------|---------|
| Índices compostos | Queries 5-10x mais rápidas |
| Corrigir getBenchmarkMetrics | Evita timeout/OOM |
| Incrementos atômicos | Elimina race conditions |
| Adicionar LIMIT | Previne queries pesadas |

> **Nota:** SELECT específico está no Plano de Média/Baixa Prioridade.

---

## Ordem de Execução

### Fase 1: Quick Wins
1. Adicionar bundle analyzer
2. Lazy load PostHogProvider
3. Lazy load CopilotShowcase

### Fase 2: Database (Migration)
4. Criar migration com índices
5. Criar função RPC para incrementos
6. Corrigir getBenchmarkMetrics
7. Restringir policy da waitlist

### Fase 3: Query Optimization
8. Adicionar LIMIT em queries
9. Dynamic import de modais