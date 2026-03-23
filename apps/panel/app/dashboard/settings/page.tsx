'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    resortName: 'Kuriftu Resort & Spa',
    description: 'A luxury resort nestled in the Ethiopian highlands offering world-class amenities and authentic hospitality.',
    location: 'Addis Ababa, Ethiopia',
    email: 'admin@kuriftu.com',
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Settings"
          subtitle="Manage your resort information and preferences"
        />

        <div className="p-8 max-w-2xl space-y-8">
          {/* Resort Information */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground">Resort Information</h2>
              <p className="text-sm text-foreground/70 mt-1">Update your resort details</p>
            </div>

            <div className="space-y-6">
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

              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
                {saved && (
                  <span className="text-sm text-primary flex items-center gap-2">
                    ✓ Changes saved successfully
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground">Subscription</h2>
              <p className="text-sm text-foreground/70 mt-1">Manage your plan and billing</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div>
                  <p className="font-medium text-foreground">Premium Plan</p>
                  <p className="text-sm text-foreground/70 mt-1">$99/month • All features included</p>
                </div>
                <span className="text-sm font-medium text-primary">Active</span>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-foreground/70 mb-4">Next billing date: April 23, 2026</p>
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary/50">
                  Manage Billing
                </Button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground">Security</h2>
              <p className="text-sm text-foreground/70 mt-1">Manage your account security</p>
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

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-foreground/70 mt-1">Not enabled</p>
                </div>
                <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary/50">
                  Enable
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
              <p className="text-sm text-foreground/70 mt-1">Irreversible actions</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-foreground/70 mt-1">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
