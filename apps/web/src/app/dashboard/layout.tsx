import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './_components/sidebar'
import { MobileNav } from './_components/mobile-nav'
import { AuthTracker } from './_components/auth-tracker'
import { CopilotFAB } from './_components/copilot-fab'
import { getUserProfile } from '@/lib/subscription/check-access'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch user's subscription plan
  const profile = await getUserProfile(user.id)
  const plan = profile?.plan || 'free'

  return (
    <div className="min-h-screen bg-sand">
      {/* Skip link para acessibilidade */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-navy focus:ring-2 focus:ring-teal"
      >
        Pular para o conteúdo principal
      </a>
      
      {/* Auth event tracking */}
      <Suspense fallback={null}>
        <AuthTracker />
      </Suspense>
      
      {/* Desktop Sidebar */}
      <Sidebar email={user.email} plan={plan} />
      
      {/* Mobile Navigation */}
      <MobileNav email={user.email} plan={plan} />
      
      {/* Main Content */}
      <main id="main-content" className="md:ml-52 pt-14 md:pt-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {/* Copilot FAB - Desktop only */}
      <CopilotFAB />
    </div>
  )
}
