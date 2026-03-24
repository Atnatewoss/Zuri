'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { Shield, CreditCard, Building2, AlertTriangle, CheckCircle2, Save } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    resortName: 'Kuriftu Resort & Spa',
    description: 'A luxury resort nestled in the Ethiopian highlands offering world-class amenities and authentic hospitality.',
    location: 'Addis Ababa, Ethiopia',
    email: 'admin@kuriftu.com',
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    const hotelId = getTenantHotelId()
    if (!hotelId) {
      setError('No resort session found.')
      setLoading(false)
      return
    }

    apiFetch<{ resort_name: string; description: string; location: string; email: string }>(
      `/api/settings?hotel_id=${encodeURIComponent(hotelId)}`
    )
      .then((settings) => {
        setFormData({
          resortName: settings.resort_name,
          description: settings.description,
          location: settings.location,
          email: settings.email,
        })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    const hotelId = getTenantHotelId()
    if (!hotelId) {
      setError('No resort session found.')
      return
    }

    setError(null)
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
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Settings"
          subtitle="Manage your resort information and preferences"
        />

        <div className="p-8 space-y-8 w-full">
          {/* Resort Information */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 space-y-8 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-foreground">Resort Identity</h2>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mt-1">Core details of your heritage</p>
              </div>
            </div>

            <div className="space-y-6">
              {loading && <p className="text-sm text-foreground/60">Loading settings...</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="resortName" className="text-foreground">Resort Name</Label>
                <Input
                  id="resortName"
                  name="resortName"
                  value={formData.resortName}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-border/50">
                <Button
                  onClick={handleSave}
                  className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4 mr-2" /> SAVE IDENTITY
                </Button>
                {saved && (
                  <span className="text-sm text-primary flex items-center gap-2 font-medium animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" /> Changes immortalized.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-foreground">Sanctuary Security</h2>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mt-1">Safeguard your operation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-foreground/70 mt-1">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary/50">
                  Change
                </Button>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-8 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full rounded-full py-6 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 tracking-widest text-[10px] font-bold"
            >
              TERMINATE SESSION (SIGN OUT)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
