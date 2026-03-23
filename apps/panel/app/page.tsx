'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, BarChart3, ChevronRight, Zap, Target, Layers } from 'lucide-react'
import { ProductPeek, ChatPeek } from '@/components/product-peek'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="text-3xl font-serif tracking-tight text-foreground flex items-center gap-2">
            Zuri <span className="text-primary/60 text-xl font-sans font-light italic">Concierge</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors tracking-wide">
              MEMBER SIGN IN
            </Link>
            <Button asChild size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium tracking-tight">
              <Link href="/signup">RESERVE ACCESS</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-48">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-10 animate-fade-in">
              <div className="flex flex-col gap-8">
                <h1 className="text-balance text-6xl sm:text-7xl lg:text-8xl font-serif leading-[1.05] text-foreground tracking-tighter">
                  The <span className="italic">Service</span> <br />
                  of Exceptional <br />
                  Hospitality.
                </h1>
                <p className="text-xl text-foreground/50 leading-relaxed max-w-xl font-light tracking-tight">
                  Zuri elevates world-class resort operations with a sophisticated service layer—delivering personalized guest engagement and refined operational excellence.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="xl" className="rounded-full px-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 tracking-widest text-[10px] font-bold">
                  <Link href="/signup" className="flex items-center gap-2">
                    ACTIVATE SERVICE <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="rounded-full px-12 border-foreground/10 hover:bg-foreground/5 dark:border-foreground/20 tracking-widest text-[10px] font-bold">
                  <Link href="#features">VIEW CAPABILITIES</Link>
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="pt-8 border-t border-border/50 flex items-center gap-4 text-sm tracking-[0.2em] text-foreground/40 font-medium uppercase">
                <span>ESTABLISHED 2026</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>LUXURY GRADE AI</span>
              </div>
            </div>

            {/* Right Visual - High Quality Image with Product Peek Overlays */}
            <div className="hidden lg:block relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 animate-slide-in-right border border-white/5 bg-secondary/10">
              <Image 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
                alt="Luxury Resort Visual"
                fill
                className="object-cover opacity-80"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              
              {/* Product Overlays */}
              <ProductPeek />
              <ChatPeek />
              
              {/* LV Style Label */}
              <div className="absolute top-10 left-10 text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
                Zuri Concierge v2.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl sm:text-5xl font-serif text-foreground mb-6">
              Engineered for <span className="italic">Excellence</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Every interaction is a masterpiece. Zuri provides the intelligence behind the world&apos;s most prestigious guest experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group relative rounded-3xl border border-border bg-card p-12 hover:shadow-2xl hover:border-primary/20 transition-all duration-700 overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-48 h-48 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 scale-110">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-6">Personalized Service</h3>
              <p className="text-foreground/40 leading-relaxed font-light tracking-tight text-lg">
                Seamless resolution of guest requests with tailored logic that mirrors your resort&apos;s unique heritage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-3xl border border-border bg-card p-12 hover:shadow-2xl hover:border-primary/20 transition-all duration-700 overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-48 h-48 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 scale-110">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-6">Service Velocity</h3>
              <p className="text-foreground/40 leading-relaxed font-light tracking-tight text-lg">
                Accelerate response times across all touchpoints with instant automated booking and excursion management.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-3xl border border-border bg-card p-12 hover:shadow-2xl hover:border-primary/20 transition-all duration-700 overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layers className="w-48 h-48 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 scale-110">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-6">Integrated Management</h3>
              <p className="text-foreground/40 leading-relaxed font-light tracking-tight text-lg">
                Seamlessly unify your Property Management Systems with refined guest preference harvesting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-serif text-foreground mb-8">
            Your Infinite <span className="italic">Front Desk</span>
          </h2>
          <p className="text-xl text-foreground/60 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Join the world&apos;s elite hospitality brands in redefining the guest experience. Start your journey with Zuri today.
          </p>
          <Button asChild size="xl" className="rounded-full px-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30">
            <Link href="/signup">RESERVE YOUR CONCIERGE</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="text-lg font-light text-foreground">Zuri</div>
            <p className="text-sm text-foreground/60">© 2026 Zuri. Elevating hospitality with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
