'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { setSessionToken, setTenantHotelId } from '@/lib/tenant'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    resortName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      const signup = await apiFetch<{ resort: { hotel_id: string; resort_name: string }; session_token: string }>(
        '/api/resorts/signup',
        {
          method: 'POST',
          bodyJson: {
            resort_name: formData.resortName,
            location: 'Pending setup',
            email: formData.email,
          },
        }
      )
      setTenantHotelId(signup.resort.hotel_id)
      setSessionToken(signup.session_token)
      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="flex min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-zinc-50 p-12 border-r border-border">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 uppercase">
            ZURI
          </Link>
          
          <div className="max-w-md">
            <h2 className="text-3xl font-medium text-zinc-900 mb-6 leading-tight">
              Streamline your guest experience.
            </h2>
            <p className="text-zinc-600 mb-10 leading-relaxed">
              Join leading luxury properties in automating guest requests, answering FAQs natively in 4 languages, and driving direct bookings through an intelligent concierge widget.
            </p>
            
            <div className="space-y-4 text-sm text-zinc-600 border-l-2 border-primary/20 pl-4">
              <p>“Implementing Zuri fundamentally changed how efficiently our front desk operates.”</p>
              <p className="font-medium text-zinc-900">— General Manager, Early Adopter</p>
            </div>
          </div>
          
          <div className="text-xs text-zinc-400">
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
                Create your account
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Enter your details to get started with your Zuri dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="resortName" className="text-sm font-medium text-zinc-700">Property Name</Label>
                <Input
                  id="resortName"
                  name="resortName"
                  placeholder="e.g. Grand Ocean Resort"
                  value={formData.resortName}
                  onChange={handleChange}
                  required
                  className="bg-white border-zinc-200 text-zinc-900 h-11 focus-visible:ring-primary"
                />
              </div>

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
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</Label>
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
                {loading ? 'Creating Account...' : 'Sign up'}
              </Button>

              {error && (
                <div className="p-3 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}

              <p className="text-center text-sm text-zinc-500 pt-4">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-zinc-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
