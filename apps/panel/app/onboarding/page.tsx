'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    resortName: '',
    description: '',
    location: '',
    services: [] as string[],
    rooms: [] as { type: string; price: string }[],
    files: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleServiceChange = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.includes(service)
        ? formData.services.filter((s) => s !== service)
        : [...formData.services, service],
    })
  }

  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { type: '', price: '' }],
    })
  }

  const updateRoom = (index: number, field: string, value: string) => {
    const newRooms = [...formData.rooms]
    newRooms[index] = { ...newRooms[index], [field]: value }
    setFormData({ ...formData, rooms: newRooms })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.resortName && formData.description && formData.location
      case 2:
        return formData.services.length > 0
      case 3:
        return formData.rooms.length > 0
      case 5:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs text-foreground/60 hidden sm:block">
                  {step === 1 && 'Resort Info'}
                  {step === 2 && 'Services'}
                  {step === 3 && 'Rooms'}
                  {step === 4 && 'Knowledge'}
                  {step === 5 && 'Finish'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Step 1: Resort Info */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-foreground mb-2">Resort Information</h2>
              <p className="text-foreground/70">Tell us about your luxury resort</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resortName" className="text-foreground">Resort Name *</Label>
                <Input
                  id="resortName"
                  name="resortName"
                  placeholder="e.g., Kuriftu Resort & Spa"
                  value={formData.resortName}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe your resort and its unique features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-foreground mb-2">Services & Amenities</h2>
              <p className="text-foreground/70">Select the services your resort offers</p>
            </div>

            <div className="space-y-4">
              {['Spa & Wellness', 'Fine Dining', 'Activities & Tours', 'Room Service', 'Concierge Desk', 'Event Planning'].map(
                (service) => (
                  <div key={service} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                    <Checkbox
                      id={service}
                      checked={formData.services.includes(service)}
                      onCheckedChange={() => handleServiceChange(service)}
                    />
                    <Label htmlFor={service} className="cursor-pointer flex-1 font-medium">
                      {service}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 3: Rooms */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-foreground mb-2">Room Types</h2>
              <p className="text-foreground/70">Define your available room categories and pricing</p>
            </div>

            <div className="space-y-6">
              {formData.rooms.map((room, index) => (
                <div key={index} className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-secondary/10">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm">Room Type</Label>
                    <Input
                      placeholder="e.g., Deluxe Room"
                      value={room.type}
                      onChange={(e) => updateRoom(index, 'type', e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm">Price per Night</Label>
                    <Input
                      placeholder="e.g., $250"
                      value={room.price}
                      onChange={(e) => updateRoom(index, 'price', e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={addRoom}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-secondary/50"
              >
                + Add Room Type
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Knowledge Upload */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-foreground mb-2">Train Your AI</h2>
              <p className="text-foreground/70">Upload resort information to train your AI concierge</p>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-foreground mb-2">Drag & Drop Files Here</h3>
              <p className="text-foreground/70 mb-4">or click to select</p>
              <p className="text-sm text-foreground/50">Supports: PDF, DOC, DOCX, TXT</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/20 border border-border">
              <p className="text-sm text-foreground/70">
                <strong>Tip:</strong> Upload your resort handbook, pricing guides, policies, and room descriptions for better AI responses.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Finish */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-4xl font-light text-foreground mb-4">Your AI Concierge is Ready</h2>
              <p className="text-lg text-foreground/70 max-w-lg mx-auto">
                Zuri is fully configured and ready to start delivering exceptional guest experiences. Let's go to your dashboard to get started.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-medium text-foreground mb-3">What's next?</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>✓ View real-time guest interactions</li>
                <li>✓ Monitor booking requests</li>
                <li>✓ Customize your AI responses</li>
                <li>✓ Embed Zuri on your website</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary/50"
            disabled={currentStep === 1}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!canProceed()}
          >
            {currentStep === 5 ? 'Go to Dashboard' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
