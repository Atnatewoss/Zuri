'use client'

import { Bell, Search, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuth } from '@/lib/tenant'
import Link from 'next/link'
import { useSidebarStore } from '@/store/sidebar'
import { useResort } from '@/lib/resort-context'
import { handleLogout } from '@/lib/api'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { resort, loading, resetResort } = useResort()
  const toggleSidebar = useSidebarStore(state => state.toggle)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  
  // Treat missing resort data as loading if we're in the dashboard
  const isLoading = loading || !resort
  
  const resortName = resort?.resortName
  const adminEmail = resort?.email

  const handleSignOut = () => {
    handleLogout()
  }

  // Get initials for profile circle
  const initials = resortName
    ? resortName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : ''

  return (
    <header className="border-b border-border bg-background sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-24">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="ml-1">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="hidden md:block text-sm text-muted-foreground mt-1 font-normal tracking-normal normal-case">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => !isLoading && setProfileOpen(!profileOpen)}
              disabled={isLoading}
              className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border border-transparent ${isLoading ? 'cursor-wait' : 'hover:bg-muted hover:border-border group'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${isLoading ? 'bg-muted border-border animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {isLoading ? '' : (initials || 'ZR')}
              </div>
              <div className="hidden sm:block text-left">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                    <div className="w-16 h-2 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-foreground leading-none">{resortName}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-none uppercase tracking-wider font-bold">Admin Panel</p>
                  </>
                )}
              </div>
              {!isLoading && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`} />}
            </button>
            
            {profileOpen && !loading && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-popover border border-border shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-3">
                  <div className="px-5 py-4 border-b border-border mb-2 bg-muted/50 rounded-t-2xl -mt-2">
                    <p className="text-sm font-semibold text-popover-foreground truncate">{resortName || 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{adminEmail || 'admin@property.com'}</p>
                  </div>
                  <div className="px-2">
                    <Link href="/dashboard/settings" className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3 transition-colors">
                       <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                    </Link>
                  </div>
                  <div className="px-2 pt-2 mt-2 border-t border-border">
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-3 transition-colors"
                    >
                       <LogOut className="w-4 h-4 text-destructive/80" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
