'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { setTenantHotelId, setTenantResortName } from '@/lib/tenant'
import { toast } from 'sonner'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await apiFetch<{ 
        resort: { hotel_id: string; resort_name: string };
      }>(
        '/api/resorts/signup',
        {
          method: 'POST',
          bodyJson: {
            resort_name: formData.resortName,
            location: 'Pending setup',
            email: formData.email,
            password: formData.password
          },
        }
      )
      setTenantHotelId(response.resort.hotel_id)
      setTenantResortName(response.resort.resort_name)
      router.push('/onboarding')
    } catch (err) {
      toast.error('Sign-up failed', {
        description:
          err instanceof Error
            ? err.message
            : 'Unable to create your account right now. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-white dark:text-zinc-900">
      <div className="flex min-h-screen">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between w-[50%] bg-zinc-50 p-16 xl:p-20 border-r border-zinc-200">
          <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">
            ZURI
          </Link>
          
          <div className="max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-medium text-zinc-900 mb-8 leading-[1.15]">
              Streamline your guest experience.
            </h2>
            <p className="text-lg xl:text-xl text-zinc-600 mb-12 leading-relaxed opacity-90">
              Join leading luxury properties in automating guest requests, answering FAQs natively in 4 languages, and driving direct bookings through an intelligent concierge widget.
            </p>
            
            <div className="space-y-5 text-base xl:text-lg text-zinc-600 border-l-4 border-primary/30 pl-6">
              <p className="italic font-light opacity-90">“Implementing Zuri fundamentally changed how efficiently our front desk operates.”</p>
              <p className="font-semibold text-zinc-900 tracking-wide">— General Manager, Early Adopter</p>
            </div>
          </div>
          
          <div className="text-sm text-zinc-400 font-medium tracking-wide">
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
                Create your account
              </h1>
              <p className="mt-3 text-base text-zinc-500">
                Enter your details to get started with your Zuri dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="resortName" className="text-base font-medium text-zinc-700">Property Name</Label>
                <input
                  id="resortName"
                  name="resortName"
                  placeholder="e.g. Grand Ocean Resort"
                  value={formData.resortName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-[52px] bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-zinc-700">Work Email</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@property.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full h-[52px] bg-white border border-zinc-200 rounded-xl text-base px-4 shadow-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-zinc-700">Password</Label>
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
                {loading ? 'Creating Account...' : 'Sign up'}
              </Button>

              <p className="text-center text-[15px] text-zinc-500 pt-6">
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
