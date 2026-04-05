'use client'

import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Github, Linkedin } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

export default function ContactPage() {
   return (
      <div
         className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100 flex flex-col font-sans relative"
         style={{
            '--primary': 'oklch(0.45 0.1 60)',
            '--primary-foreground': 'oklch(1 0 0)'
         } as React.CSSProperties}
      >
         <SiteHeader darkText={true} />

         <main className="flex-1 w-full px-8 lg:px-24 max-w-[1920px] mx-auto flex flex-col items-center justify-center pt-32 pb-24">
            <div className="grid lg:grid-cols-2 gap-24 w-full items-center relative z-10">

               <div className="max-w-xl">
                  <h1 className="text-5xl lg:text-7xl font-medium tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent">
                     Build the future <br /> of hospitality.
                  </h1>
                  <p className="text-xl lg:text-2xl text-zinc-600 leading-relaxed font-light mb-12">
                     Zuri is an open ecosystem. Explore our architecture, watch our deep dives, and join us in reshaping the guest journey through transparent, agentic AI.
                  </p>

                  <div className="space-y-6 text-base font-medium text-zinc-500 border-l border-black/10 pl-8">
                     <p className="flex items-center gap-4 transition-colors hover:text-zinc-900 cursor-default"><ArrowRight className="w-5 h-5 text-primary" /> Multi-tenant RAG Infrastructure</p>
                     <p className="flex items-center gap-4 transition-colors hover:text-zinc-900 cursor-default"><ArrowRight className="w-5 h-5 text-primary" /> Native Multilingual NLP</p>
                     <p className="flex items-center gap-4 transition-colors hover:text-zinc-900 cursor-default"><ArrowRight className="w-5 h-5 text-primary" /> Real-time Booking Orchestration</p>
                  </div>
               </div>

               <div className="flex flex-col gap-8 w-full">
                  <a
                     href="https://github.com/Atnatewoss/Zuri"
                     target="_blank"
                     rel="noreferrer"
                     className="group relative bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 p-10 rounded-[2.5rem] transition-all flex flex-col items-start overflow-hidden shadow-sm"
                  >
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Github className="w-7 h-7 text-zinc-900" />
                     </div>
                     <h3 className="text-3xl font-medium mb-3 text-zinc-900">Technical Architecture</h3>
                     <p className="text-zinc-500 text-lg font-light leading-relaxed mb-8">
                        Deeper into the core: Explore the API specs, the vector engine, and the agentic frontend.
                     </p>
                     <div className="mt-auto inline-flex items-center gap-2 text-sm font-mono text-zinc-400 group-hover:text-zinc-900 transition-all">
                        github.com/Atnatewoss/Zuri <ArrowRight className="w-4 h-4" />
                     </div>
                  </a>

                  <a
                     href="https://youtu.be/RUp7V8arhIA?si=iiA5whJRT_R47-oD"
                     target="_blank"
                     rel="noreferrer"
                     className="group relative bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 p-10 rounded-[2.5rem] transition-all flex flex-col items-start overflow-hidden shadow-sm"
                  >
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Play className="w-7 h-7 text-red-600 fill-red-600" />
                     </div>
                     <h3 className="text-3xl font-medium mb-3 text-zinc-900">Watch the Demo</h3>
                     <p className="text-zinc-500 text-lg font-light leading-relaxed mb-8">
                        See Zuri in action: From technical setup to real-world guest interactions at Kuriftu resorts.
                     </p>
                     <div className="mt-auto inline-flex items-center gap-2 text-sm font-mono text-zinc-400 group-hover:text-red-600 transition-all">
                        youtube.com/@zuriai-concierge <ArrowRight className="w-4 h-4" />
                     </div>
                  </a>
               </div>

            </div>
         </main>

         {/* Decorative Elements */}
         <div className="fixed top-0 right-0 -z-0 w-[500px] h-[500px] bg-amber-100/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4 pointer-events-none" />
         <div className="fixed bottom-0 left-0 -z-0 w-[600px] h-[600px] bg-indigo-50/40 blur-[140px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />
      </div>
   )
}
