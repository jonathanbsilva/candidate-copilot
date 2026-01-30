import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './_components/sidebar'
import { MobileNav } from './_components/mobile-nav'
import { AuthTracker } from './_components/auth-tracker'
import { CopilotFAB } from './_components/copilot-fab'
import { getUserProfile } from '@/lib/subscription/check-access'

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
      {/* Auth event tracking */}
      <Suspense fallback={null}>
        <AuthTracker />
      </Suspense>
      
      {/* Desktop Sidebar */}
      <Sidebar email={user.email} plan={plan} />
      
      {/* Mobile Navigation */}
      <MobileNav email={user.email} plan={plan} />
      
      {/* Main Content */}
      <main className="md:ml-52 pt-14 md:pt-0">
        {children}
      </main>
      
      {/* Copilot FAB - Desktop only */}
      <CopilotFAB />
    </div>
  )
}
