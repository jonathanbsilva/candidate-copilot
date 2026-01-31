import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase: faltam variáveis de ambiente. Crie apps/web/.env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Valores em: https://supabase.com/dashboard/project/_/settings/api'
  )
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}
