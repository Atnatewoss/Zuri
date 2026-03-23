'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: '📚' },
  { href: '/dashboard/services', label: 'Services & Rooms', icon: '🏨' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
  { href: '/dashboard/embed', label: 'Embed Widget', icon: '🧩' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex w-64 border-r border-border bg-sidebar h-screen flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-border">
        <div className="text-2xl font-light tracking-wide text-sidebar-foreground">
          Zuri<span className="font-normal"> ✨</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-6 py-6 space-y-4">
        <div className="text-sm text-sidebar-foreground/70">
          <p className="font-medium mb-2">Kuriftu Resort</p>
          <p className="text-xs">Addis Ababa, Ethiopia</p>
        </div>
        <button className="w-full px-4 py-2 rounded-lg border border-sidebar-border text-sidebar-foreground text-sm hover:bg-sidebar-accent transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  )
}
