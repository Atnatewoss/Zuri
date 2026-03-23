'use client'

import { BarChart3, MessageSquare, Zap, Activity } from 'lucide-react'

export function ProductPeek() {
  return (
    <div className="absolute bottom-10 -left-10 w-72 glass p-6 rounded-2xl animate-float border border-white/20 shadow-2xl z-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Live Support</span>
        </div>
        <Zap className="w-3 h-3 text-primary" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-serif text-white/80">Guest Engagement</span>
          <span className="text-xs font-mono text-emerald-400">+12%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[85%] animate-grow-x" />
        </div>
        
        <div className="pt-2 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[8px] font-bold text-foreground">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-white/40">3 active resolutions</span>
        </div>
      </div>
    </div>
  )
}

export function ChatPeek() {
  return (
    <div className="absolute top-10 -right-10 w-64 glass p-4 rounded-xl animate-float-delayed border border-white/20 shadow-2xl z-20">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-3 h-3 text-primary" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">AI Concierge</span>
      </div>
      <div className="space-y-2">
        <div className="bg-white/5 p-2 rounded-lg text-[10px] text-white/80 font-light border border-white/5">
          "I've arranged the sunset cruise for Dr. Aris. Should I prep the suite with his preferred vintage?"
        </div>
        <div className="flex justify-end font-serif italic text-[10px] text-primary">
          Preparing guest request...
        </div>
      </div>
    </div>
  )
}
