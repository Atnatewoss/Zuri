'use client'

import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight } from 'lucide-react'

export default function ContactPage() {
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-white text-zinc-900 selection:bg-zinc-200 flex flex-col font-sans relative dark:bg-white dark:text-zinc-900"
      style={{
        '--primary': 'oklch(0.45 0.1 60)',
        '--primary-foreground': 'oklch(1 0 0)'
      } as React.CSSProperties}
    >
      <SiteHeader darkText hideNav />
      
      <main className="flex-1 w-full px-8 lg:px-24 max-w-[1920px] mx-auto h-full flex items-center justify-center pt-16">
        <div className="grid lg:grid-cols-2 gap-16 w-full items-center">
           
           <div className="max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-medium tracking-tight mb-6 leading-[1.05]">
                 Let's reshape your <br/> guest journey.
              </h1>
              <p className="text-lg lg:text-xl opacity-70 leading-relaxed font-light mb-10">
                 Whether you manage an independent boutique resort or an international hotel chain, our team is ready to demonstrate how Zuri can dramatically enhance efficiency and guest satisfaction.
              </p>
              
              <div className="space-y-4 text-sm font-medium opacity-80 border-l-2 border-primary/20 pl-6">
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Enterprise Deployments</p>
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Custom Integration Support</p>
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Technical Specifications</p>
              </div>
           </div>

           <div className="bg-zinc-50 rounded-3xl p-10 lg:p-14 border border-zinc-200 h-fit">
              <form className="space-y-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <Label className="text-sm font-semibold text-zinc-700">First Name</Label>
                       <input className="w-full h-14 bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-sm font-semibold text-zinc-700">Last Name</Label>
                       <input className="w-full h-14 bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans" placeholder="Doe" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                     <Label className="text-sm font-semibold text-zinc-700">Property Email</Label>
                     <input className="w-full h-14 bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans" placeholder="john@resort.com" type="email" />
                 </div>

                 <div className="space-y-2">
                     <Label className="text-sm font-semibold text-zinc-700">Message</Label>
                     <textarea className="w-full h-32 bg-white border border-zinc-200 rounded-xl text-base p-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 placeholder:text-zinc-400" placeholder="How can we help your property?" />
                 </div>

                 <Button type="button" className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base tracking-wide font-medium shadow-xl hover:bg-primary/90 hover:scale-[1.02] transition-transform">
                   Send Inquiry
                 </Button>
              </form>
           </div>

        </div>
      </main>
    </div>
  )
}
