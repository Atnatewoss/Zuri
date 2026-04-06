'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { setTenantHotelId } from '@/lib/tenant'
import { toast } from 'sonner'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { resort, is_onboarded } = await apiFetch<{ 
        resort: { hotel_id: string },
        is_onboarded: boolean
      }>('/api/auth/login', {
        method: 'POST',
        bodyJson: formData
      });

      // Save hotel context (auth cookies are managed by backend)
      setTenantHotelId(resort.hotel_id);

      if (!is_onboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error('Sign-in failed', {
        description:
          err instanceof Error
            ? err.message
            : 'Unable to sign you in at this time. Please try again.',
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-white dark:text-zinc-900">
      <div className="flex min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-[50%] bg-zinc-50 p-16 xl:p-20 border-r border-zinc-200 relative overflow-hidden">
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
              
              <div className="mt-5 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 font-medium text-[11px] uppercase tracking-wider">Demo Credentials</span>
                </div>
                <div className="flex gap-2">
                  <div className='flex items-center justify-center gap-2'>
                    <span>Email: </span>
                    <div className="flex items-center justify-between bg-white border border-zinc-200/60 shadow-sm rounded-md px-3 py-2 cursor-pointer hover:border-zinc-300 transition-colors" onClick={() => { navigator.clipboard.writeText('bishoftu@kuriftu.com'); toast.success('Email copied to clipboard'); }}>
                      <span className="text-zinc-700 font-mono text-xs">bishoftu@kuriftu.com</span>
                      <button type="button" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Copy Email">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-center gap-2'>
                    <span>Password:</span>
                    <div className="flex items-center justify-between bg-white border border-zinc-200/60 shadow-sm rounded-md px-3 py-2 cursor-pointer hover:border-zinc-300 transition-colors" onClick={() => { navigator.clipboard.writeText('123456'); toast.success('Password copied to clipboard'); }}>
                      <span className="text-zinc-700 font-mono text-xs">123456</span>
                      <button type="button" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Copy Password">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-zinc-700">Work Email</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="demo-admin@platform.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-[52px] bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium text-zinc-700">Password</Label>
                  <Link href="#" className="text-[15px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-[52px] bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors mt-5 text-base font-medium shadow-xl hover:scale-[1.01]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-[15px] text-zinc-500 pt-6">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>


          </div>
        </div>
      </div>
    </div>
  )
}
