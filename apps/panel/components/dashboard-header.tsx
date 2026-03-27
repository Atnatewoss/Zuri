'use client'

import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between px-8 md:px-12 lg:px-20 h-24">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-500 mt-1 font-normal tracking-normal normal-case">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                KR
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-zinc-900 leading-none">Kuriftu Resort</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-none uppercase tracking-wider font-bold">Resort Admin</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-zinc-200 shadow-2xl z-20 py-3 animate-in fade-in slide-in-from-top-3">
                  <div className="px-5 py-4 border-b border-zinc-100 mb-2">
                    <p className="text-sm font-semibold text-zinc-900 truncate">Kuriftu Resort & Spa</p>
                    <p className="text-xs text-zinc-500 truncate mt-1">admin@kuriftu.com</p>
                  </div>
                  <div className="px-2">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg flex items-center gap-3 transition-colors">
                       <User className="w-4 h-4 text-zinc-400" /> Account Profile
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg flex items-center gap-3 transition-colors">
                       <Settings className="w-4 h-4 text-zinc-400" /> Resort Preferences
                    </button>
                  </div>
                  <div className="px-2 pt-2 mt-2 border-t border-zinc-100">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors">
                       <LogOut className="w-4 h-4 text-red-400" /> Sign Out
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
