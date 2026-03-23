'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
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
    // Simulate login
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex items-center justify-center bg-secondary/30 px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0%,transparent_70%)]" />
          </div>
          <div className="text-center max-w-md relative z-10 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-10 text-primary">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-5xl font-serif text-foreground mb-8">
              Welcome <span className="italic">Back</span>
            </h2>
            <p className="text-lg text-foreground/60 mb-12 leading-relaxed font-light">
              Access your bespoke orchestration panel to refine and manage your resort&apos;s digital guest experience.
            </p>
            <div className="space-y-6 text-left">
              <div className="flex gap-4 items-center text-sm font-medium tracking-widest text-foreground/40 border-b border-border/50 pb-4">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>ORCHESTRATE INTERACTIONS</span>
              </div>
              <div className="flex gap-4 items-center text-sm font-medium tracking-widest text-foreground/40 border-b border-border/50 pb-4">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>MANAGE PRESTIGE SERVICES</span>
              </div>
              <div className="flex gap-4 items-center text-sm font-medium tracking-widest text-foreground/40 border-b border-border/50 pb-4">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span>INSIGHTS & ANALYTICS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-12">
              <Link href="/" className="text-3xl font-serif tracking-tight text-foreground flex items-center gap-2">
                Zuri <span className="text-primary/60 text-xl font-sans font-light italic">Concierge</span>
              </Link>
              <h1 className="mt-10 text-4xl font-serif text-foreground">
                Sign In
              </h1>
              <p className="mt-3 text-foreground/50 font-light">
                Secure access to your resort management suite
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-foreground/70">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                  Sign up
                </Link>
              </p>
            </form>

            {/* Demo Info */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-foreground/60 text-center mb-4">
                Demo credentials available. Try any email and password combination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
