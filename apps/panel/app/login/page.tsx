'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        <div className="hidden lg:flex items-center justify-center bg-secondary/40 px-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-3xl font-light text-foreground mb-4">
              Welcome Back
            </h2>
            <p className="text-foreground/70 mb-8 leading-relaxed">
              Access your Zuri AI Concierge dashboard to manage guest experiences and view analytics.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">→</span>
                <span>Real-time Guest Interactions</span>
              </div>
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">→</span>
                <span>Manage Bookings & Services</span>
              </div>
              <div className="flex gap-3 items-center text-sm text-foreground/80">
                <span className="text-2xl">→</span>
                <span>View Detailed Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <Link href="/" className="text-2xl font-light tracking-wide text-foreground">
                Zuri<span className="font-normal"> ✨</span>
              </Link>
              <h1 className="mt-6 text-3xl font-light text-foreground">
                Sign In to Your Resort
              </h1>
              <p className="mt-2 text-foreground/70">
                Access your AI Concierge dashboard
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
