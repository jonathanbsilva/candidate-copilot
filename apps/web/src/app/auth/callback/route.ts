import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  // Handle error from Supabase (e.g., expired link)
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  if (errorParam) {
    console.error('[Auth Callback] Error from provider:', errorParam, errorDescription)
    return NextResponse.redirect(`${origin}/auth?error=${errorParam}`)
  }

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name)
          },
        },
      }
    )
    
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Exchange error:', error.message, error.code)
      return NextResponse.redirect(`${origin}/auth?error=auth_failed&message=${encodeURIComponent(error.message)}`)
    }
    
    if (data.user) {
      const user = data.user
      // Check if user is new by comparing created_at (within last 30 seconds)
      const createdAt = new Date(user.created_at).getTime()
      const now = Date.now()
      const isNewUser = (now - createdAt) < 30000 // 30 seconds
      
      // Determine auth provider
      const provider = user.app_metadata.provider || 'email'
      
      // Pass tracking info via query params for client-side tracking
      const redirectUrl = new URL(redirect, origin)
      redirectUrl.searchParams.set('auth_event', isNewUser ? 'signup' : 'login')
      redirectUrl.searchParams.set('auth_method', provider)
      redirectUrl.searchParams.set('auth_user_id', user.id)
      
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  console.error('[Auth Callback] No code provided')
  // Return to auth page if there's an error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
