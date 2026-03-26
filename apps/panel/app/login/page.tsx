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
    <div className="min-h-screen bg-background font-sans">
      <div className="flex min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-zinc-50 p-12 border-r border-border relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             {/* Subtle generic pattern instead of AI sparkles */}
             <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
             </svg>
          </div>
          
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 uppercase relative z-10">
            ZURI
          </Link>
          
          <div className="max-w-md relative z-10 pb-20">
            <h2 className="text-3xl font-medium text-zinc-900 mb-6 leading-tight">
              Welcome back.
            </h2>
            <p className="text-zinc-600 mb-8 leading-relaxed">
              Sign in to manage your property setup, oversee guest interactions, and monitor your AI concierge performance.
            </p>
          </div>
          
          <div className="text-xs text-zinc-400 relative z-10">
            © 2026 Zuri Concierge
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
          {/* Mobile Header Logo */}
          <Link href="/" className="lg:hidden absolute top-8 left-8 text-xl font-bold tracking-tight text-zinc-900 uppercase">
            ZURI
          </Link>

          <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-zinc-900">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Enter your details to access your dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700">Work Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@property.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border-zinc-200 text-zinc-900 h-11 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</Label>
                  <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
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
                  className="bg-white border-zinc-200 text-zinc-900 h-11 focus-visible:ring-primary"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors mt-2 font-medium"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-zinc-500 pt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>

            {/* Demo Info */}
            <div className="mt-8 pt-6 border-t border-zinc-200 bg-zinc-50/50 rounded-lg p-4 text-center border-dashed">
              <p className="text-xs text-zinc-500">
                Demo credentials active. Any email/password combination will work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
