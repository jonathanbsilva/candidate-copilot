'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, ClipboardList, Lightbulb, Mic, 
  Settings, Sparkles, Menu, X, LogOut, Crown
} from 'lucide-react'
import { Badge } from '@ui/components'
import { CopilotDrawer } from './copilot-chat'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'

const navItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: ClipboardList, label: 'Minhas Vagas', href: '/dashboard/aplicacoes' },
  { icon: Lightbulb, label: 'Insights', href: '/dashboard/insights' },
  { icon: Mic, label: 'Interview Pro', href: '/dashboard/interview-pro', badge: 'Pro' },
]

interface MobileNavProps {
  email?: string
  plan?: 'free' | 'pro'
}

export function MobileNav({ email, plan = 'free' }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { open: openCopilotDrawer } = useCopilotDrawer()

  const closeMenu = () => setIsOpen(false)
  
  const openCopilot = () => {
    closeMenu()
    openCopilotDrawer()
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-stone/30 z-50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-navy" />
          </div>
          <span className="font-semibold text-navy">GoHire</span>
          {plan === 'pro' && (
            <Badge className="bg-amber text-navy text-[10px] px-1.5 py-0.5">
              Pro
            </Badge>
          )}
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Copilot quick access button */}
          <button
            onClick={openCopilotDrawer}
            className="p-2 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 transition-colors"
            aria-label="Abrir Copilot"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-navy/70 hover:bg-stone/10 transition-colors"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-navy/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`
          md:hidden fixed top-0 right-0 h-screen w-64 bg-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-stone/30">
          <span className="font-semibold text-navy">Menu</span>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg text-navy/70 hover:bg-stone/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`
                  flex items-center h-12 px-4 mx-2 rounded-lg
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
                  <Badge className="ml-auto text-xs bg-amber/20 text-amber">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
          
          {/* Copilot Button in menu */}
          <button
            onClick={openCopilot}
            className="
              flex items-center h-12 px-4 mx-2 rounded-lg w-[calc(100%-1rem)]
              text-navy/70 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-150
            "
          >
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="ml-3 text-sm font-medium">Copilot</span>
            <Badge className="ml-auto text-xs bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
              AI
            </Badge>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone/30 py-4">
          {/* Upgrade link for free users */}
          {plan === 'free' && (
            <Link
              href="/dashboard/plano"
              onClick={closeMenu}
              className="
                flex items-center h-12 px-4 mx-2 rounded-lg mb-1
                bg-amber/10 text-amber hover:bg-amber/20 transition-colors duration-150
              "
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Fazer upgrade</span>
            </Link>
          )}
          
          <Link
            href="/dashboard/configuracoes"
            onClick={closeMenu}
            className={`
              flex items-center h-12 px-4 mx-2 rounded-lg
              transition-colors duration-150
              ${pathname === '/dashboard/configuracoes'
                ? 'bg-amber/10 text-amber' 
                : 'text-navy/70 hover:bg-stone/10 hover:text-navy'
              }
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3 text-sm font-medium">Configurações</span>
          </Link>
          
          {email && (
            <div className="px-4 mx-2 py-2 text-xs text-navy/50 truncate">
              {email}
            </div>
          )}
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center h-12 px-4 mx-2 rounded-lg
                text-navy/70 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Sair</span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Copilot Drawer */}
      <CopilotDrawer />
    </>
  )
}
