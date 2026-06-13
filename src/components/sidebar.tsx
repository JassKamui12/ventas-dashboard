'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  ShoppingBag, LayoutDashboard, Package, ClipboardList,
  Share2, Settings, LogOut, Menu, X, Zap, BookOpen
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const nav = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/orders', label: 'Órdenes', icon: ClipboardList },
  { href: '/dashboard/channels', label: 'Canales', icon: Share2 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
  { href: '/dashboard/help', label: 'Ayuda', icon: BookOpen },
]

export function Sidebar({ businessName }: { businessName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function logout() {
    clearToken()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-500/30 flex-shrink-0">
          <Zap className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white tracking-tight">VentasIA</p>
          {businessName && (
            <p className="text-xs text-slate-400 truncate max-w-36 leading-tight mt-0.5">{businessName}</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: avatar placeholder + logout */}
      <div className="px-3 pb-4 border-t border-white/8 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/30">
            <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          {businessName && (
            <span className="text-xs text-slate-400 truncate max-w-32">{businessName}</span>
          )}
        </div>
        <button
          onClick={logout}
          aria-label="Cerrar sesión"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-slate-950 min-h-screen fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950 border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/20">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white">VentasIA</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-950 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
