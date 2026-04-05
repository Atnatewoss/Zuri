'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { FadeInView } from '@/components/fade-in-view'
import { Play, CheckCircle2, ChevronRight, BookOpen, Clock, ShieldCheck } from 'lucide-react'

export default function TutorialPage() {
  const steps = [
    {
      title: "Quick Onboarding",
      description: "Connect your resort's basic information and secure your unique AI instance in less than 2 minutes.",
      icon: <Clock className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Knowledge Ingestion",
      description: "Upload your property's PDFs, handbooks, and service lists. Our RAG engine processes them instantly.",
      icon: <BookOpen className="w-6 h-6 text-amber-600" />
    },
    {
      title: "Widget Customization",
      description: "Tailor the AI's personality and appearance to match your brand's unique hospitality style.",
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />
    }
  ]

  return (
    <div 
      className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100 flex flex-col font-sans relative"
      style={{
        '--primary': 'oklch(0.45 0.1 60)',
        '--primary-foreground': 'oklch(1 0 0)'
      } as React.CSSProperties}
    >
      <SiteHeader darkText={true} />

      <main className="flex-1 w-full pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-8 lg:px-24 mb-16">
          <FadeInView className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-medium tracking-tight mb-6 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent">
              Mastering the Art of <br /> Digital Hospitality
            </h1>
            <p className="text-xl opacity-60 font-light max-w-2xl mx-auto leading-relaxed">
              Experience the full potential of Zuri. This brief tutorial guides you through setting up your AI concierge and transforming your guest journey.
            </p>
          </FadeInView>
        </section>

        {/* Video Section */}
        <section className="px-8 lg:px-24 mb-32">
          <FadeInView delay={200} className="max-w-5xl mx-auto group">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-black/5 bg-zinc-100 transition-transform duration-700 hover:scale-[1.01]">
              {/* Placeholder YouTube Embed */}
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/RUp7V8arhIA" 
                title="Zuri Platform Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
              
              {/* Subtle glass overlay for aesthetics when not playing (optional effect) */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-3xl z-10" />
            </div>
          </FadeInView>
        </section>

        {/* Steps Grid */}
        <section className="px-8 lg:px-24 py-24 bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto">
            <FadeInView className="grid md:grid-cols-3 gap-12 lg:gap-16">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                    <p className="text-opacity-70 font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </FadeInView>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-8 lg:px-24 py-32 text-center">
          <FadeInView className="flex flex-col items-center">
            <h2 className="text-4xl font-medium tracking-tight mb-8">Ready to elevate your resort?</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-full px-8 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl h-14 text-base font-semibold transition-transform hover:scale-105">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-medium border-black/10 hover:bg-zinc-200">
                <Link href="/contact" className="flex items-center gap-2">
                  Explore Architecture <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </FadeInView>
        </section>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-amber-100/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/40 blur-[140px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />
    </div>
  )
}
