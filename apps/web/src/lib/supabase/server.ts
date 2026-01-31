import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window === 'undefined' && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  throw new Error(
    'Supabase: faltam variáveis de ambiente. Crie apps/web/.env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Valores em: https://supabase.com/dashboard/project/_/settings/api (copie de .env.example se precisar).'
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Handle cookies in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Handle cookies in Server Components
          }
        },
      },
    }
  )
}
