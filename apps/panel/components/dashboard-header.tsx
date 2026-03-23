'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-10 py-6">
        <div>
          <h1 className="text-3xl font-serif text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-foreground/40 text-sm font-light mt-1 tracking-wide uppercase">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
