'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, ArrowDown, ChevronRight, Mic, CreditCard, Languages } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col font-sans">
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 mix-blend-difference text-white">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-8 lg:px-24 py-6">
          <div className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
            ZURI
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-medium tracking-wide">
            <Link href="#products" className="hover:opacity-70 transition-opacity">Products</Link>
            <Link href="#success-stories" className="hover:opacity-70 transition-opacity">Success Stories</Link>
            <Link href="#integrations" className="hover:opacity-70 transition-opacity">Integrations</Link>
            <Link href="#contact" className="hover:opacity-70 transition-opacity">Contact Us</Link>
          </div>
          
          <div className="flex items-center">
            {/* Real button in white to contrast mix-blend-difference */}
            <Button asChild className="rounded-full px-8 bg-white hover:bg-white/90 text-black font-semibold tracking-tight h-12">
              <Link href="/signup">Book a Demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {/* Full Viewport Hero Section */}
        <section className="relative w-full h-screen min-h-[800px] flex flex-col items-center justify-center overflow-hidden bg-primary/95 text-primary-foreground">
          {/* Faux Background Image gradient overlay to simulate the cinematic hotel vibe */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50 z-0 mix-blend-multiply" />
          
          <div className="relative z-10 text-center flex flex-col items-center w-full px-8 lg:px-24">
            <h1 className="text-xl sm:text-2xl font-medium tracking-wide mb-6 opacity-90">
              Introducing
            </h1>
            
            <h2 className="text-balance text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-medium leading-[0.95] tracking-tight mb-14 drop-shadow-sm">
              The AI Concierge <br />
              Widget
            </h2>
            
            <Button variant="outline" className="rounded-full bg-white text-black hover:bg-white/90 hover:text-black border-none h-14 px-8 text-base font-medium shadow-xl flex items-center gap-3">
              <Play className="w-4 h-4 fill-black" />
              Watch Video
            </Button>
          </div>

          {/* Bottom indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium tracking-wide">Start exploring</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </section>

        {/* Feature 1: The Widget */}
        <section className="py-24 lg:py-32 w-full bg-background border-b border-border">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
               
               {/* Text content */}
               <div className="max-w-xl">
                 <div className="text-sm font-semibold tracking-widest uppercase mb-6 opacity-60">01 / The Interface</div>
                 <h3 className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                   A seamless layer on your website.
                 </h3>
                 <p className="text-xl opacity-70 leading-relaxed font-light">
                   Zuri isn't another destination. It's a lightweight widget that embeds directly into your existing resort or hotel website. It provides immediate, contextual assistance to guests without interrupting their browsing experience.
                 </p>
               </div>

               {/* Clean Mockup (No Slop) */}
               <div className="bg-secondary rounded-3xl aspect-square xl:aspect-video flex items-center justify-center relative overflow-hidden border border-border h-fit py-12">
                 {/* Abstract representation of a website with the widget */}
                  <div className="absolute inset-10 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden flex flex-col">
                    <div className="h-16 border-b border-black/5 flex items-center px-8 bg-zinc-50">
                      <div className="w-24 h-4 bg-zinc-200 rounded-sm"></div>
                      <div className="ml-auto w-12 h-3 bg-zinc-200 rounded-sm border-r border-transparent"></div>
                      <div className="ml-4 w-12 h-3 bg-zinc-200 rounded-sm"></div>
                      <div className="ml-4 w-16 h-3 bg-zinc-800 rounded-sm"></div>
                    </div>
                    
                    {/* The Zuri Widget Mock at bottom right */}
                    <div className="absolute bottom-8 right-8 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col overflow-hidden transition-transform duration-700 hover:scale-105">
                      <div className="p-5 border-b border-black/5 flex items-center gap-3">
                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                         <div className="font-medium text-sm">Zuri Concierge</div>
                      </div>
                      <div className="p-5 flex-1 bg-zinc-50 flex flex-col gap-3 text-sm">
                         <div className="p-3 bg-white border border-black/5 rounded-xl rounded-tl-sm self-start w-[85%] shadow-sm">
                           How can I help you perfect your stay?
                         </div>
                         <div className="p-3 bg-primary text-primary-foreground rounded-xl rounded-tr-sm self-end w-[85%] shadow-sm flex gap-2 items-end">
                           <Mic className="w-4 h-4 opacity-50 shrink-0 mb-0.5" />
                           "What time does the spa open on Sunday?"
                         </div>
                      </div>
                      <div className="p-4 border-t border-black/5 bg-white flex gap-3 items-center">
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

        {/* Feature 2: Multilingual Voice - Now Visual First */}
        <section className="py-24 lg:py-32 w-full bg-secondary border-b border-border">
          <div className="mx-auto w-full max-w-[1920px] px-8 lg:px-24">
             <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
               
               {/* Clean Typographic Visual NOW FIRST in HTML & Grid */}
               <div className="bg-white rounded-3xl h-fit flex flex-col items-center justify-center p-8 lg:p-12 border border-border shadow-sm w-full">
                 <div className="w-full border-b border-black/5 flex items-center justify-between py-6 lg:py-8 px-4 lg:px-8 text-xl lg:text-3xl font-light">
                   <span>English</span>
                   <span className="opacity-40 tabular-nums font-mono text-xs tracking-widest">ENG</span>
                 </div>
                 <div className="w-full border-b border-black/5 flex items-center justify-between py-6 lg:py-8 px-4 lg:px-8 text-xl lg:text-3xl font-light">
                   <span>Amharic</span>
                   <span className="opacity-40 tabular-nums font-mono text-xs tracking-widest">AMH</span>
                 </div>
                 <div className="w-full border-b border-black/5 flex items-center justify-between py-6 lg:py-8 px-4 lg:px-8 text-xl lg:text-3xl font-light">
                   <span>Tigrinya</span>
                   <span className="opacity-40 tabular-nums font-mono text-xs tracking-widest">TIR</span>
                 </div>
                 <div className="w-full flex items-center justify-between py-6 lg:py-8 px-4 lg:px-8 text-xl lg:text-3xl font-light">
                   <span>Oromifa</span>
                   <span className="opacity-40 tabular-nums font-mono text-xs tracking-widest">ORM</span>
                 </div>
               </div>

               <div className="max-w-xl">
                 <div className="text-sm font-semibold tracking-widest uppercase mb-6 opacity-60">02 / Universal Communication</div>
                 <h3 className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                   Native voice interactions.
                 </h3>
                 <p className="text-xl opacity-70 leading-relaxed font-light">
                   No language barriers. Zuri speaks 4 languages flawlessly—English, Amharic, Tigrinya, and Oromifa. Guests can simply tap the microphone and speak naturally to receive tailored recommendations.
                 </p>
               </div>

             </div>
          </div>
        </section>

        {/* Feature 3: Actions */}
        <section className="py-24 lg:py-32 w-full bg-background border-b border-border">
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

               {/* Minimalist Action UI Graphic (Removed aspect-square to reduce excessive height) */}
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
                     <div className="flex items-center gap-3 bg-secondary/80 p-5 rounded-xl border border-black/5 shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-base font-medium">Transaction Complete</span>
                     </div>
                   </div>
                 </div>
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
