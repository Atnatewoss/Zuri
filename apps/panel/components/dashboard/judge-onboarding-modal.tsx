'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, ShieldCheck, PlayCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { apiFetch, PUBLIC_API_BASE_URL } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'
import { toast } from 'sonner'

export function JudgeOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    // Only show once per session using sessionStorage
    const hasSeenModal = sessionStorage.getItem('zuri_judge_onboarded')
    const currentHotelId = getTenantHotelId()
    
    if (!hasSeenModal && currentHotelId) {
      setHotelId(currentHotelId)
      // Slight delay to allow dashboard to load behind it
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSetup = async () => {
    if (!hotelId) return
    setIsProcessing(true)

    try {
      // 1. Authorize the deployed panel domain dynamically
      const currentHost = window.location.origin
      let newDomain = "https://zuriai.et" // Fallback deployed panel
      
      // If we are currently on localhost, add localhost. If on a deployed panel, add its origin.
      if (currentHost.includes('localhost')) {
         newDomain = "http://localhost:5173" // Vite default for the demo site
      } else {
         // Production demo assumption
         newDomain = "https://kuriftu-demo-site.onrender.com" // You can adjust this to your actual deployed demo site URL.
      }

      await apiFetch(`/api/settings?hotel_id=${encodeURIComponent(hotelId)}`, {
        method: 'PUT',
        bodyJson: {
          allowed_domains: newDomain
        },
      })

      // 2. Fetch the verification URL
      const verifyResult = await apiFetch<{ ok: boolean; mockup_url: string }>(
        `/api/embed/verify/${encodeURIComponent(hotelId)}`
      )
      
      toast.success("Demo Environment Ready", {
         description: "Access policies updated. Redirecting to demo site..."
      })

      // 3. Mark as seen and close modal
      sessionStorage.setItem('zuri_judge_onboarded', 'true')
      setIsOpen(false)

      // 4. Open in new tab - Use the server-provided mockup URL (now upgraded to premium)
      if (verifyResult.ok && verifyResult.mockup_url) {
         const finalUrl = `${verifyResult.mockup_url}?theme=${theme === 'light' ? 'light' : 'dark'}&audit=true`
         window.open(finalUrl, '_blank', 'noopener,noreferrer')
      } else {
         // Fallback if the verify endpoint fails
         const fallbackUrl = `${PUBLIC_API_BASE_URL}/api/embed/mockup/${hotelId}?theme=${theme === 'light' ? 'light' : 'dark'}&audit=true`
         window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      }

    } catch (error) {
      toast.error('Setup failed', {
        description: error instanceof Error ? error.message : 'Could not configure the demo environment automatically.'
      })
      // Still close it so they aren't blocked, they can manually set it up
      sessionStorage.setItem('zuri_judge_onboarded', 'true')
      setIsOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSkip = () => {
    sessionStorage.setItem('zuri_judge_onboarded', 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
       if (!open) handleSkip()
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-border shadow-2xl bg-background text-foreground rounded-3xl transition-colors duration-300">
         {/* Top Banner Area */}
         <div className="bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent p-8 pb-6 border-b border-border relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-white/10 flex items-center justify-center border border-border backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
               </div>
               <span className="text-[10px] font-mono font-medium tracking-widest text-amber-600 dark:text-amber-500 uppercase">ALX Hackathon Evaluation</span>
            </div>
            
            <DialogTitle className="text-3xl font-medium tracking-tight mb-2 text-foreground">
               Welcome to Zuri Command Center
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base leading-relaxed">
               Zuri is an <strong className="text-foreground font-semibold">Action-Capable Guest Assistant</strong> that securely accesses resort data to autonomously resolve guest requests.
            </DialogDescription>
         </div>

         {/* Content Area */}
         <div className="p-8 space-y-6">
            <div className="bg-muted/30 dark:bg-white/5 border border-border rounded-2xl p-6">
               <h3 className="text-lg font-medium text-foreground mb-3">One-Click Demo Initialization</h3>
               <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  To prevent unauthorized embedding (CORS), Zuri requires explicit domain whitelisting. Click the button below to:
               </p>
               <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-sm">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center text-[10px] mt-0.5 font-bold border border-emerald-500/20">1</span>
                     <span className="text-foreground/80">Authorize the demo resort's origin domain dynamically.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center text-[10px] mt-0.5 font-bold border border-emerald-500/20">2</span>
                     <span className="text-foreground/80">Launch the live Kuriftu Mockup Site in a new tab.</span>
                  </li>
               </ul>
               
               <Button 
                  onClick={handleSetup} 
                  disabled={isProcessing}
                  className="w-full h-14 bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl font-semibold text-base transition-all shadow-xl hover:shadow-2xl dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]"
               >
                  {isProcessing ? (
                     <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin opacity-60" />
                        <span>Configuring Access Control...</span>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        Authorize & Launch Demo
                     </div>
                  )}
               </Button>
            </div>
         </div>
         
         <DialogFooter className="px-8 pb-8 sm:justify-center border-none">
            <button 
               onClick={handleSkip}
               className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
               Skip and explore dashboard manually
            </button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
