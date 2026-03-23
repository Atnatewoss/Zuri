'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Library, Hotel, Calendar, Puzzle, Settings, LogOut, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: Library },
  { href: '/dashboard/services', label: 'Guest Services', icon: Hotel },
  { href: '/dashboard/bookings', label: 'Guest Bookings', icon: Calendar },
  { href: '/dashboard/embed', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
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

      {/* User Profile Info (Footer) */}
      <div className="px-8 py-8 border-t border-border/50 bg-secondary/5 mt-auto">
        <div className="flex items-center gap-4 group cursor-pointer hover:bg-secondary/20 p-2 -m-2 rounded-xl transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif italic text-lg shrink-0 shadow-sm group-hover:shadow-primary/20 group-hover:border-primary/40 transition-all">
            KR
          </div>
          <div className="flex flex-col min-w-0">
            <p className="font-serif italic text-lg text-foreground truncate leading-tight">Kuriftu Resort</p>
            <p className="text-[10px] text-foreground/40 font-bold truncate tracking-wider mt-0.5 uppercase">admin@kuriftu.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
