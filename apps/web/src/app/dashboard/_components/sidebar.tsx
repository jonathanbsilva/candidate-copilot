'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, ClipboardList, Lightbulb, Mic, 
  Settings, Sparkles, MessageCircle, Crown
} from 'lucide-react'
import { Badge } from '@ui/components'
import { UserMenu } from './user-menu'
import { CopilotDrawer } from './copilot-chat'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'

const navItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: ClipboardList, label: 'Minhas Vagas', href: '/dashboard/aplicacoes' },
  { icon: Lightbulb, label: 'Insights', href: '/dashboard/insights' },
  { icon: Mic, label: 'Interview Pro', href: '/dashboard/interview-pro', badge: 'Pro' },
]

interface SidebarProps {
  email?: string
  plan?: 'free' | 'pro'
}

export function Sidebar({ email, plan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const { isOpen: isCopilotOpen, open: openCopilot, close: closeCopilot } = useCopilotDrawer()

  return (
    <>
      <aside
        className="
          fixed left-0 top-0 h-screen w-52 bg-white border-r border-stone/30
          flex-col z-40 hidden md:flex
        "
      >
        {/* Logo */}
        <Link 
          href="/dashboard"
          className="h-14 flex items-center px-4 border-b border-stone/30 hover:bg-stone/10 transition-colors"
        >
          <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-navy" />
          </div>
          <span className="ml-3 font-semibold text-navy">
            GoHire
          </span>
          {plan === 'pro' && (
            <Badge className="ml-2 bg-amber text-navy text-[10px] px-1.5 py-0.5">
              Pro
            </Badge>
          )}
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center h-11 px-4 mx-2 rounded-lg
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-amber/10 text-amber' 
                    : 'text-navy/70 hover:bg-stone/10 hover:text-navy'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3 text-sm font-medium">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber/20 text-amber whitespace-nowrap">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
          
          {/* Copilot Button */}
          <button
            onClick={openCopilot}
            className="
              flex items-center h-11 px-4 mx-2 rounded-lg w-[calc(100%-1rem)]
              text-navy/70 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-150
            "
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="ml-3 text-sm font-medium">Copilot</span>
            <Badge className="ml-auto text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white whitespace-nowrap">
              AI
            </Badge>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-stone/30 py-4">
          {/* Upgrade link for free users */}
          {plan === 'free' && (
            <Link
              href="/dashboard/plano"
              className="
                flex items-center h-11 px-4 mx-2 rounded-lg mb-1
                bg-amber/10 text-amber hover:bg-amber/20 transition-colors duration-150
              "
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Fazer upgrade</span>
            </Link>
          )}

          {/* Plan management for pro users */}
          {plan === 'pro' && (
            <Link
              href="/dashboard/plano"
              className={`
                flex items-center h-11 px-4 mx-2 rounded-lg mb-1
                transition-colors duration-150
                ${pathname === '/dashboard/plano'
                  ? 'bg-amber/10 text-amber' 
                  : 'text-navy/70 hover:bg-stone/10 hover:text-navy'
                }
              `}
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Meu Plano</span>
            </Link>
          )}
          
          <Link
            href="/dashboard/configuracoes"
            className={`
              flex items-center h-11 px-4 mx-2 rounded-lg
              transition-colors duration-150
              ${pathname === '/dashboard/configuracoes'
                ? 'bg-amber/10 text-amber' 
                : 'text-navy/70 hover:bg-stone/10 hover:text-navy'
              }
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3 text-sm font-medium">Configuracoes</span>
          </Link>
          
          <UserMenu email={email} />
        </div>
      </aside>
      
      {/* Copilot Drawer */}
      <CopilotDrawer 
        isOpen={isCopilotOpen} 
        onClose={closeCopilot} 
      />
    </>
  )
}
