'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Hotel, FileText, Code, Settings, Moon, Sparkles } from 'lucide-react'
import { useSidebarStore } from '@/store/sidebar'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'

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
      { href: '/dashboard/services', label: 'Resort Services', icon: Hotel },
      { href: '/dashboard/knowledge', label: 'Resort Documents', icon: FileText },
    ]
  },
  {
    title: 'System Setup',
    items: [
      { href: '/dashboard/embed', label: 'Widget Integrations', icon: Code },
      { href: '/dashboard/persona', label: 'AI Persona', icon: Sparkles },
    ]
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isOpen, setOpen } = useSidebarStore()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Responsive defaults & mount hydration check
  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false)
      } else {
        setOpen(true)
      }
    }
    // Set initial state on mount
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setOpen])

  if (!mounted) return null // Prevent hydration mismatch

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-zinc-900/50 dark:bg-zinc-950/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Main Sidebar Container */}
      <div 
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col font-sans text-zinc-600 dark:text-zinc-300 transition-all duration-300 ease-in-out shrink-0",
          isOpen ? "w-[240px] translate-x-0" : "w-[240px] -translate-x-full md:translate-x-0 md:w-[64px]"
        )}
      >
      {/* Logo */}
      <div className={cn("py-5 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-black/20 flex items-center", isOpen ? "px-6" : "px-0 justify-center")}>
        <Link href="/dashboard" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-2">
          {isOpen ? "ZURI" : "Z"}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <div className={cn("text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3", isOpen ? "px-3" : "px-0 text-center")}>
              {isOpen ? group.title : "..."}
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
                  title={!isOpen ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 py-2 rounded-lg font-medium transition-colors text-[13px]', // Using text-[13px] instead of text-sm for a crisper, tighter fit
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white text-zinc-500 dark:text-zinc-400',
                    isOpen ? 'px-3' : 'px-0 justify-center'
                  )}
                >
                  <Icon className={cn("w-4 h-4 opacity-80 shrink-0", !isOpen && "w-5 h-5")} />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Settings at the Bottom */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-black/20">
        <div
          title={!isOpen ? "Toggle Dark Mode" : undefined}
          className={cn(
            'w-full flex items-center py-3 mb-1 rounded-lg font-medium text-[13px] text-zinc-500 dark:text-zinc-400',
            isOpen ? 'px-3 justify-between' : 'px-0 justify-center'
          )}
        >
          {isOpen && (
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 opacity-80 shrink-0" />
              <span className="truncate">Dark Mode</span>
            </div>
          )}
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} 
          />
        </div>

        <Link
          href="/dashboard/settings"
          title={!isOpen ? "General Settings" : undefined}
          className={cn(
            'flex items-center gap-3 py-2 rounded-lg font-medium transition-colors text-[13px]',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white text-zinc-500 dark:text-zinc-400',
            isOpen ? 'px-3' : 'px-0 justify-center'
          )}
        >
          <Settings className={cn("w-4 h-4 opacity-80 shrink-0", !isOpen && "w-5 h-5")} />
          {isOpen && <span className="truncate">General Settings</span>}
        </Link>
      </div>
    </div>
    </>
  )
}
