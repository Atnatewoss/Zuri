'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { setAccessToken, setRefreshToken, setTenantHotelId } from '@/lib/tenant'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { access_token, refresh_token, resort } = await apiFetch<{ 
        access_token: string, 
        refresh_token: string,
        resort: { hotel_id: string } 
      }>('/api/auth/login', {
        method: 'POST',
        bodyJson: formData
      });

      // Save credentials and hotel context
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setTenantHotelId(resort.hotel_id);

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="flex min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-[50%] bg-zinc-50 p-16 xl:p-20 border-r border-border relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             {/* Subtle generic pattern instead of AI sparkles */}
             <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                     <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.75"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
             </svg>
          </div>
          
          <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900 uppercase relative z-10">
            ZURI
          </Link>
          
          <div className="max-w-lg relative z-10 pb-20">
            <h2 className="text-4xl xl:text-5xl font-medium text-zinc-900 mb-8 leading-[1.15]">
              Welcome back.
            </h2>
            <p className="text-lg xl:text-xl text-zinc-600 mb-10 leading-relaxed opacity-90">
              Sign in to manage your property setup, oversee guest interactions, and monitor your AI concierge performance.
            </p>
          </div>
          
          <div className="text-sm text-zinc-400 relative z-10 font-medium tracking-wide">
            © 2026 Zuri Concierge
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
          {/* Mobile Header Logo */}
          <Link href="/" className="lg:hidden absolute top-8 left-8 text-xl font-bold tracking-tight text-zinc-900 uppercase">
            ZURI
          </Link>

          <div className="w-full max-w-[440px]">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl lg:text-4xl leading-tight font-medium text-zinc-900">
                Sign in to your account
              </h1>
              <p className="mt-3 text-base text-zinc-500">
                Enter your details to access your dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-zinc-700">Work Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="demo-admin@platform.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border-zinc-200 text-zinc-900 h-[52px] text-base px-4 rounded-xl shadow-sm focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium text-zinc-700">Password</Label>
                  <Link href="#" className="text-[15px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
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
                  className="bg-white border-zinc-200 text-zinc-900 h-[52px] text-base px-4 rounded-xl shadow-sm focus-visible:ring-primary"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors mt-5 text-base font-medium shadow-xl hover:scale-[1.01]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              {error && (
                <div className="p-4 mt-5 text-[15px] text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <p className="text-center text-[15px] text-zinc-500 pt-6">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>

            {/* Demo Info */}
            <div className="mt-8 pt-5 border-t border-zinc-200 bg-zinc-50/50 rounded-lg p-4 text-center border-dashed">
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
