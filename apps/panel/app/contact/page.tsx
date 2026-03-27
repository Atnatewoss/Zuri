'use client'

import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col font-sans relative">
      <SiteHeader />
      
      <main className="flex-1 w-full pt-40 px-8 lg:px-24 max-w-[1920px] mx-auto min-h-screen flex items-center mb-32">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 w-full">
           
           <div className="max-w-xl">
              <h1 className="text-5xl lg:text-7xl font-medium tracking-tight mb-8 leading-[1.05]">
                 Let's reshape your <br/> guest journey.
              </h1>
              <p className="text-xl opacity-70 leading-relaxed font-light mb-12">
                 Whether you manage an independent boutique resort or an international hotel chain, our team is ready to demonstrate how Zuri can dramatically enhance efficiency and guest satisfaction.
              </p>
              
              <div className="space-y-4 text-sm font-medium opacity-80 border-l-2 border-primary/20 pl-6">
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Enterprise Deployments</p>
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Custom Integration Support</p>
                 <p className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-primary" /> Technical Specifications</p>
              </div>
           </div>

           <div className="bg-secondary/40 rounded-3xl p-10 lg:p-14 border border-border h-fit">
              <form className="space-y-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-sm font-semibold opacity-70">First Name</Label>
                       <Input className="h-14 bg-white border-none rounded-xl text-base px-4 shadow-sm" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-sm font-semibold opacity-70">Last Name</Label>
                       <Input className="h-14 bg-white border-none rounded-xl text-base px-4 shadow-sm" placeholder="Doe" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                     <Label className="text-sm font-semibold opacity-70">Property Email</Label>
                     <Input className="h-14 bg-white border-none rounded-xl text-base px-4 shadow-sm" placeholder="john@resort.com" type="email" />
                 </div>

                 <div className="space-y-2">
                     <Label className="text-sm font-semibold opacity-70">Message</Label>
                     <textarea className="w-full h-32 bg-white border-none rounded-xl text-base p-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" placeholder="How can we help your property?" />
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
