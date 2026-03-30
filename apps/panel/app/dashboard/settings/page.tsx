'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { Shield, CreditCard, Building2, AlertTriangle, CheckCircle2, Save } from 'lucide-react'
import { apiFetch, API_BASE_URL } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { clearAuth, getTenantHotelId } from '@/lib/tenant'
import { useSettingsStore } from '@/lib/store'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const store = useSettingsStore()

  const [formData, setFormData] = useState({
    resortName: store.resortName || '',
    description: store.description || '',
    location: store.location || '',
    email: store.email || '',
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    if (store.isLoaded) {
      setLoading(false)
      return
    }

    const hotelId = getTenantHotelId()
    if (!hotelId) {
      router.push('/login')
      return
    }

    Promise.all([
      apiFetch<{ resort_name: string; description: string; location: string; email: string; allowed_domains: string }>(
        `/api/settings?hotel_id=${encodeURIComponent(hotelId)}`
      ),
      apiFetch<{ is_onboarded: boolean }>(
        `/api/dashboard/stats?hotel_id=${encodeURIComponent(hotelId)}`
      )
    ])
      .then(([settings, stats]) => {
        if (!stats.is_onboarded) {
          router.push('/onboarding')
          return
        }
        const fetchedData = {
          resortName: settings.resort_name || '',
          description: settings.description || '',
          location: settings.location || '',
          email: settings.email || '',
        }
        store.setSettings({ ...fetchedData, isLoaded: true })
        setFormData(fetchedData)
      })
      .catch((err) => {
        toast.error('Unable to load settings', {
          description:
            err instanceof Error
              ? err.message
              : 'We could not load your settings right now. Please try again.',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    const hotelId = getTenantHotelId()
    if (!hotelId) {
      toast.error('Session missing', {
        description: 'No resort session was found. Please sign in again.',
      })
      return
    }

    try {
      await apiFetch(`/api/settings?hotel_id=${encodeURIComponent(hotelId)}`, {
        method: 'PUT',
        bodyJson: {
          resort_name: formData.resortName,
          description: formData.description,
          location: formData.location,
          email: formData.email,
        },
      })
      store.setSettings(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error('Unable to save settings', {
        description:
          err instanceof Error
            ? err.message
            : 'We could not save your settings right now. Please try again.',
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // best effort
    }
    clearAuth()
    router.push('/login')
  }

  return (
    <div className="flex bg-background min-h-screen font-sans text-foreground">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <DashboardHeader
          title="Settings"
          subtitle="Manage your resort information and preferences"
          resortName={formData.resortName}
          adminEmail={formData.email}
          loading={loading}
        />

        <div className="flex-1 overflow-auto w-full p-8 md:p-12 lg:px-20 mx-auto max-w-[1600px] space-y-8 pb-32">
          {/* Resort Information */}
          <div className="rounded-2xl border border-border bg-card p-8 space-y-8 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-card-foreground">Resort Identity</h2>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Core details of your heritage</p>
              </div>
            </div>

              <div className="space-y-6">
              {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}
              <div className="space-y-2">
                <Label htmlFor="resortName" className="text-muted-foreground">Resort Name</Label>
                <Input
                  id="resortName"
                  name="resortName"
                  value={formData.resortName}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-muted-foreground">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-border">
                <Button
                  onClick={handleSave}
                  className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-none"
                >
                  <Save className="w-4 h-4 mr-2" /> SAVE IDENTITY
                </Button>
                {saved && (
                  <span className="text-sm text-emerald-600 flex items-center gap-2 font-medium animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" /> Changes immortalized.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-border bg-card p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-card-foreground">Sanctuary Security</h2>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Safeguard your operation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-border/80 transition-colors">
                <div>
                  <p className="font-medium text-card-foreground">Password</p>
                  <p className="text-sm text-muted-foreground mt-1">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted">
                  Change
                </Button>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-8 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-full py-6 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 tracking-widest text-[10px] font-bold"
            >
              TERMINATE SESSION (SIGN OUT)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
