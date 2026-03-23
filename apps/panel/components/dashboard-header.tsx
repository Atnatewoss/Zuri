'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-3xl font-light text-foreground">{title}</h1>
          {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary/50">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground font-medium">
            KR
          </div>
        </div>
      </div>
    </div>
  )
}
