'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, BarChart3, ChevronRight } from 'lucide-react'

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
                <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-serif leading-[1.1] text-foreground">
                  The Art of <br />
                  <span className="italic text-primary">Exceptional</span> Hospitality
                </h1>
                <p className="text-xl text-foreground/70 leading-relaxed max-w-xl font-light">
                  Zuri empowers world-class resorts with a sophisticated AI concierge, delivering 24/7 personalized service that transforms stay into a seamless journey of luxury.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="xl" className="rounded-full px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20">
                  <Link href="/signup" className="flex items-center gap-2">
                    BEGIN TRANSFORMATION <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="rounded-full px-10 border-foreground/10 hover:bg-foreground/5 dark:border-foreground/20">
                  <Link href="#features">EXPLORE CAPABILITIES</Link>
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="pt-8 border-t border-border/50 flex items-center gap-4 text-sm tracking-[0.2em] text-foreground/40 font-medium uppercase">
                <span>ESTABLISHED 2026</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>LUXURY GRADE AI</span>
              </div>
            </div>

            {/* Right Visual - High Quality Image */}
            <div className="hidden lg:block relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 animate-slide-in-left border border-white/10">
              <Image 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
                alt="Luxury Resort Visual"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
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
            <div className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-10 hover:bg-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-4">Intelligent Concierge</h3>
              <p className="text-foreground/60 leading-relaxed font-light">
                Our AI understands subtle nuances, providing personalized recommendations that feel authentically human and deeply intuitive.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-10 hover:bg-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-24 h-24 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-4">Timeless Presence</h3>
              <p className="text-foreground/60 leading-relaxed font-light">
                Luxury never sleeps. Deliver impeccable service and instant booking management any hour of the day, across the globe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-10 hover:bg-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-24 h-24 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-4">Bespoke Insights</h3>
              <p className="text-foreground/60 leading-relaxed font-light">
                Anticipate guest needs before they emerge. Deep analytics provide a granular understanding of every preference and pattern.
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
