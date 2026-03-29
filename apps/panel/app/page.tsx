'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, ArrowDown, Mic, CreditCard, ArrowUp } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div 
      className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-200 flex flex-col font-sans relative dark:bg-white dark:text-zinc-900"
      style={{
        '--primary': 'oklch(0.45 0.1 60)',
        '--primary-foreground': 'oklch(1 0 0)'
      } as React.CSSProperties}
    >
      
      <SiteHeader />

      {/* Floating Scroll to Top */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <button 
          onClick={scrollToTop}
          className="w-14 h-14 bg-white shadow-xl shadow-black/10 border border-black/5 rounded-full flex items-center justify-center text-black hover:bg-zinc-50 hover:scale-110 transition-transform"
        >
           <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 w-full">
        {/* Full Viewport Hero Section */}
        <section className="relative w-full h-[100dvh] min-h-[800px] flex flex-col items-center justify-center overflow-hidden bg-primary/95 text-primary-foreground">
          {/* Faux Background Image gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50 z-0 mix-blend-multiply pointer-events-none" />
          
          <div className="relative z-10 text-center flex flex-col items-center w-full px-8 lg:px-24">
            <h1 className="text-xl sm:text-2xl font-medium tracking-wide mb-6 opacity-90">
              Introducing
            </h1>
            
            <h2 className="text-balance text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-medium leading-[0.95] tracking-tight mb-14 drop-shadow-sm">
              The AI Concierge <br />
              Widget
            </h2>
            
            <button className="rounded-full bg-white text-black hover:bg-white/90 hover:text-black border-none h-14 px-8 text-base font-medium shadow-xl flex items-center gap-3 transition-colors cursor-pointer">
              <Play className="w-4 h-4 fill-black text-black" />
              Watch Video
            </button>
          </div>

          {/* Bottom indicator */}
          <div 
            onClick={scrollToFeatures}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <span className="text-sm font-medium tracking-wide">Start exploring</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </section>

        {/* capabilities header */}
        <section className="pt-32 pb-4 w-full bg-white border-b-0">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24 text-center">
             <h2 className="text-4xl lg:text-5xl font-medium tracking-tight opacity-90">
                Platform Capabilities
             </h2>
          </div>
        </section>

        {/* Feature 1: The Widget */}
        <section id="features" className="py-24 lg:py-32 w-full bg-white border-b border-zinc-200">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
               
               <div className="max-w-xl">
                 <div className="text-sm font-semibold tracking-widest uppercase mb-6 opacity-60">01 / The Interface</div>
                 <h3 className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                   A seamless layer on your website.
                 </h3>
                 <p className="text-xl opacity-70 leading-relaxed font-light">
                   Zuri isn't another destination. It's a lightweight widget that embeds directly into your existing resort or hotel website. It provides immediate, contextual assistance to guests without interrupting their browsing experience.
                 </p>
               </div>

               <div className="bg-secondary rounded-3xl xl:aspect-video flex items-center justify-center relative overflow-hidden border border-border h-fit py-12 px-6">
                  <div className="w-full max-w-[600px] aspect-video bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden flex flex-col relative z-0">
                    <div className="h-12 sm:h-16 border-b border-black/5 flex items-center px-6 bg-zinc-50 w-full shrink-0">
                      <div className="w-20 sm:w-24 h-4 bg-zinc-200 rounded-sm"></div>
                      <div className="ml-auto w-10 sm:w-12 h-3 bg-zinc-200 rounded-sm border-r border-transparent"></div>
                      <div className="ml-4 w-10 sm:w-12 h-3 bg-zinc-200 rounded-sm hidden sm:block"></div>
                      <div className="ml-4 w-12 sm:w-16 h-3 bg-zinc-800 rounded-sm"></div>
                    </div>
                    
                    {/* The Zuri Widget Mock at bottom right */}
                    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-[280px] sm:w-[320px] h-80 sm:h-96 bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col overflow-hidden transition-transform duration-700 hover:scale-105 z-10">
                      <div className="p-4 sm:p-5 border-b border-black/5 flex items-center gap-3 shrink-0">
                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                         <div className="font-medium text-sm">Zuri Concierge</div>
                      </div>
                      <div className="p-4 sm:p-5 flex-1 bg-zinc-50 flex flex-col gap-3 text-sm overflow-hidden justify-end">
                         <div className="p-3 bg-white border border-black/5 rounded-xl rounded-tl-sm self-start w-[85%] shadow-sm">
                           How can I help you perfect your stay?
                         </div>
                         <div className="p-3 bg-primary text-primary-foreground rounded-xl rounded-tr-sm self-end w-[85%] shadow-sm flex gap-2 items-end">
                           <Mic className="w-4 h-4 opacity-50 shrink-0 mb-0.5" />
                           "What time does the spa open on Sunday?"
                         </div>
                      </div>
                      <div className="p-4 border-t border-black/5 bg-white flex gap-3 items-center shrink-0">
                        <div className="h-10 border border-black/10 rounded-full flex-1 px-4 flex items-center text-zinc-400 text-sm">
                          Speak or type...
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
               
             </div>
          </div>
        </section>

        {/* Feature 2: Multilingual Voice overlay magic */}
        <section className="py-24 lg:py-32 w-full bg-zinc-50 border-b border-zinc-200">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start relative">
               
               {/* Language list with overlay transitions */}
               <div className="flex flex-col gap-4 w-full">
                 
                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-zinc-900 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      Welcome to your stay
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">English</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">ENG</span>
                 </div>
                 
                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-emerald-700 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      እንኳን ደህና መጡ
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Amharic</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">AMH</span>
                 </div>
                 
                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-[#A68361] translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      እንቋዕ ብደሓን መጻእኩም
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Tigrinya</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">TIR</span>
                 </div>
                 
                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-[#D39D55] translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      Baga nagaan dhuftan
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Oromifa</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">ORM</span>
                 </div>

                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      Ku soo dhawaaw
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Somali</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">SOM</span>
                 </div>

                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-emerald-800 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20" style={{ direction: 'rtl' }}>
                      مرحباً بكم
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Arabic</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">ARA</span>
                 </div>

                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      Bienvenue
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">French</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">FRA</span>
                 </div>

                 <div className="bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow group/lang relative w-full flex items-center justify-between py-8 lg:py-10 px-6 lg:px-10 text-xl lg:text-3xl font-light overflow-hidden rounded-2xl cursor-default shrink-0">
                    <div className="absolute inset-0 bg-red-700 translate-y-full group-hover/lang:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-6 lg:px-10 text-white font-medium z-20">
                      Benvenuto
                    </div>
                    <span className="relative z-10 transition-colors group-hover/lang:opacity-0 delay-75">Italian</span>
                    <span className="relative z-10 opacity-40 tabular-nums font-mono text-sm tracking-widest transition-colors group-hover/lang:opacity-0 delay-75">ITA</span>
                 </div>
                 
               </div>

               <div className="max-w-xl lg:sticky lg:top-[30vh] lg:pb-24">
                 <div className="text-sm font-semibold tracking-widest uppercase mb-6 opacity-60">02 / Universal Communication</div>
                 <h3 className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                   Native voice interactions.
                 </h3>
                 <p className="text-xl opacity-70 leading-relaxed font-light">
                   No language barriers. Zuri speaks 8 languages flawlessly—English, Amharic, Tigrinya, Oromifa, Somali, Arabic, French, and Italian. Guests can simply tap the microphone and speak naturally to receive tailored recommendations.
                 </p>
               </div>

             </div>
          </div>
        </section>

        {/* Feature 3: Actions  */}
        <section id="integrations" className="py-24 lg:py-32 w-full bg-white border-b border-zinc-200">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
               
               <div className="max-w-xl">
                 <div className="text-sm font-semibold tracking-widest uppercase mb-6 opacity-60">03 / Agentic Behavior</div>
                 <h3 className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                   It books rooms automatically.
                 </h3>
                 <p className="text-xl opacity-70 leading-relaxed font-light">
                   Zuri isn't just an answering machine. It actively drives conversions by securely booking rooms, orchestrating late checkouts, and upselling experiences based on deep integration with your property data.
                 </p>
               </div>

               <div className="bg-primary/5 rounded-3xl h-fit flex items-center justify-center p-8 lg:p-16 border border-primary/10 w-full">
                 <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-2xl shadow-2xl border border-black/5 flex flex-col gap-8">
                   <div className="flex items-center gap-4 text-sm font-medium border-b border-black/5 pb-5">
                     <CreditCard className="w-5 h-5 opacity-60" />
                     Room Booking Agent
                   </div>
                   
                   <div className="flex flex-col gap-2">
                     <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest opacity-40">Request</div>
                     <div className="text-xl sm:text-2xl font-light">Reserve Ocean Suite for 2 nights</div>
                   </div>

                   <div className="flex flex-col gap-2 pt-2">
                     <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest opacity-40">Status</div>
                     <div className="flex items-center gap-3 bg-zinc-100 p-5 rounded-xl border border-black/5 shadow-inner text-zinc-900">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-base font-medium">Transaction Complete</span>
                     </div>
                   </div>
                 </div>
               </div>
               
             </div>
          </div>
        </section>

        {/* Frictionless Deployment Section */}
        <section className="py-24 lg:py-32 w-full bg-zinc-50 border-b border-zinc-200">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="text-center max-w-2xl mx-auto mb-20">
                <h2 className="text-5xl lg:text-6xl font-medium tracking-tight mb-6">
                   Live in 5 minutes.
                </h2>
                <p className="text-xl opacity-70 font-light leading-relaxed">
                   No engineering team required. Zuri is designed for immediate deployment. Just upload your PDFs and drop our script tag on your website.
                </p>
             </div>
             
             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-6">
                      1
                   </div>
                   <h4 className="text-xl font-medium">Create Account</h4>
                   <p className="opacity-70 font-light">Register your property details and set up your admin profile.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-6">
                      2
                   </div>
                   <h4 className="text-xl font-medium">Train the AI</h4>
                   <p className="opacity-70 font-light">Upload your existing menus, policies, and service directories to instantly train your concierge.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-6">
                      3
                   </div>
                   <h4 className="text-xl font-medium">Embed Script</h4>
                   <p className="opacity-70 font-light">Copy our single-line JavaScript snippet and paste it into the root of your website.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-6">
                      4
                   </div>
                   <h4 className="text-xl font-medium">Go Live</h4>
                   <p className="opacity-70 font-light">Watch as your new AI concierge begins engaging and booking guests immediately.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Huge Bottom CTA */}
        <section className="py-40 w-full bg-primary text-primary-foreground text-center">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24 flex flex-col items-center">
            <h2 className="text-6xl sm:text-7xl lg:text-[7rem] font-medium leading-[0.95] tracking-tight mb-14 drop-shadow-sm">
              Modernize your <br /> guest journey.
            </h2>
            <Button asChild size="xl" className="rounded-full bg-white text-black hover:bg-white/90 shadow-2xl h-16 px-12 text-lg font-semibold tracking-tight transition-transform hover:scale-105">
              <Link href="/signup">Book a Demo</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
