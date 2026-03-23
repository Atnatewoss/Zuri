'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Library, Hotel, Calendar, Puzzle, Settings, LogOut, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/knowledge', label: 'Intelligence', icon: Library },
  { href: '/dashboard/services', label: 'Services', icon: Hotel },
  { href: '/dashboard/bookings', label: 'Reservations', icon: Calendar },
  { href: '/dashboard/embed', label: 'Orchestration', icon: Puzzle },
  { href: '/dashboard/settings', label: 'Configuration', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex w-72 border-r border-border bg-sidebar h-screen flex-col sticky top-0 shadow-2xl shadow-black/5">
      {/* Logo */}
      <div className="px-8 py-10 border-b border-border/50">
        <Link href="/" className="text-3xl font-serif tracking-tight text-foreground flex items-center gap-2">
          Zuri <span className="text-primary/60 text-xl font-sans font-light italic">Concierge</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5 rounded-xl font-medium transition-all duration-300 tracking-wide group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary/60")} />
              <span className="text-sm font-medium">{item.label.toUpperCase()}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-8 py-8 space-y-6">
        <div className="space-y-1">
          <p className="font-serif italic text-lg text-foreground">Kuriftu Resort</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Addis Ababa, Ethiopia</p>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border/50 text-foreground/40 text-xs font-bold tracking-widest hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all duration-300">
          <LogOut className="w-4 h-4" /> SIGN OUT
        </button>
      </div>
    </div>
  )
}
