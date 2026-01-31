import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User, SupabaseClient } from '@supabase/supabase-js'

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

/**
 * Helper para obter usuario autenticado
 * Centraliza a logica de autenticacao que se repete em todas as server actions
 * 
 * @returns { supabase, user, error }
 * - supabase: Cliente Supabase para queries
 * - user: Usuario autenticado ou null
 * - error: Mensagem de erro se nao autenticado
 * 
 * @example
 * const { supabase, user, error } = await getAuthenticatedUser()
 * if (error) return { error }
 */
export async function getAuthenticatedUser(): Promise<{
  supabase: SupabaseClient
  user: User | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { supabase, user: null, error: 'Não autenticado' }
  }

  return { supabase, user, error: null }
}
