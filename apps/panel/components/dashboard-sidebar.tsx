'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Hotel, FileText, Code, Settings } from 'lucide-react'

// UX Psychology Information Architecture for the Sidebar
// Separating operational daily tasks, static knowledge tasks, and technical system configurations.
const navGroups = [
  {
    title: 'Daily Operations',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/bookings', label: 'Guest Reservations', icon: Calendar },
    ]
  },
  {
    title: 'Property Intelligence',
    items: [
      { href: '/dashboard/services', label: 'Our Services', icon: Hotel },
      { href: '/dashboard/knowledge', label: 'Company Documents', icon: FileText },
    ]
  },
  {
    title: 'System Setup',
    items: [
      { href: '/dashboard/embed', label: 'Widget Integrations', icon: Code },
    ]
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()

  // Reduced width (240px instead of 260+px) for that 'zoomed out / 10% smaller' tighter look.
  // Using very sleek deep zinc colors.
  return (
    <div className="hidden md:flex w-[240px] bg-zinc-950 border-r border-zinc-800 flex-col h-screen sticky top-0 font-sans text-zinc-300">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800/60 bg-black/20">
        <Link href="/dashboard" className="text-xl font-bold tracking-tighter text-white uppercase flex items-center gap-2">
          ZURI
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-[13px]', // Using text-[13px] instead of text-sm for a crisper, tighter fit
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-zinc-800/60 hover:text-white text-zinc-400'
                  )}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Settings at the Bottom */}
      <div className="p-3 border-t border-zinc-800/60 bg-black/20">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-[13px]',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-zinc-800/60 hover:text-white text-zinc-400'
          )}
        >
          <Settings className="w-4 h-4 opacity-80" />
          <span>General Settings</span>
        </Link>
      </div>
    </div>
  )
}
