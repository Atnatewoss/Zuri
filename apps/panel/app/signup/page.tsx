'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    resortName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate signup
    setTimeout(() => {
      setLoading(false)
      router.push('/onboarding')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <Link href="/" className="text-2xl font-light tracking-wide text-foreground">
                Zuri<span className="font-normal"> ✨</span>
              </Link>
              <h1 className="mt-6 text-3xl font-light text-foreground">
                Create Your Concierge
              </h1>
              <p className="mt-2 text-foreground/70">
                Get started with Zuri for your resort in minutes
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resortName" className="text-foreground">Resort Name</Label>
                <Input
                  id="resortName"
                  name="resortName"
                  placeholder="e.g. Kuriftu Resort"
                  value={formData.resortName}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-foreground placeholder:text-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@resort.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-foreground placeholder:text-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-foreground placeholder:text-foreground/50"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Creating Concierge...' : 'Create Your Concierge'}
              </Button>

              <p className="text-center text-sm text-foreground/70">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-foreground/60 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex items-center justify-center bg-secondary/40 px-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🏨</div>
            <h2 className="text-3xl font-light text-foreground mb-4">
              Luxury Hotels Choose Zuri
            </h2>
            <p className="text-foreground/70 mb-8 leading-relaxed">
              Transform your guest experience with AI-powered concierge services designed for premium hospitality.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">✓</span>
                <span>24/7 Guest Support</span>
              </div>
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">✓</span>
                <span>Smart Booking Automation</span>
              </div>
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">✓</span>
                <span>Guest Analytics & Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
