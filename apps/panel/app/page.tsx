'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-light tracking-wide text-foreground">
            Zuri<span className="font-normal"> ✨</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-foreground">
                  Elevate Your Guest Experience with AI Concierge
                </h1>
                <p className="text-lg text-foreground/70 leading-relaxed max-w-lg">
                  Zuri helps your resort provide 24/7 intelligent guest support and booking automation. Streamline operations while delivering personalized service that exceeds expectations.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#features">View Demo</Link>
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="pt-4 border-t border-border/50 text-sm text-foreground/60">
                <p>Trusted by luxury resorts worldwide</p>
              </div>
            </div>

            {/* Right Visual - Elegant Placeholder */}
            <div className="hidden lg:block relative h-96">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-border/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏨</div>
                  <p className="text-foreground/50 font-light">Luxury Resort Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
              Why Choose Zuri
            </h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Everything you need to deliver exceptional guest experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-xl border border-border bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-medium text-foreground mb-3">AI-Powered</h3>
              <p className="text-foreground/70 leading-relaxed">
                Intelligent concierge that understands guest needs and provides personalized recommendations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-border bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-xl font-medium text-foreground mb-3">24/7 Availability</h3>
              <p className="text-foreground/70 leading-relaxed">
                Always-on guest support that handles requests, bookings, and inquiries instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-border bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-foreground mb-3">Deep Insights</h3>
              <p className="text-foreground/70 leading-relaxed">
                Detailed analytics on guest interactions, preferences, and booking patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-light text-foreground mb-6">
            Ready to Transform Your Resort?
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            Join luxury hospitality leaders who are elevating guest experiences with Zuri AI Concierge.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signup">Create Your Concierge Now</Link>
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
