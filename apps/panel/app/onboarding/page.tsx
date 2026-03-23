'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Home, ConciergeBell, BedDouble, GraduationCap, ChevronRight, ChevronLeft, Upload, Check } from 'lucide-react'

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
              <div key={step} className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-500 border-2 ${
                    step <= currentStep
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-transparent border-border text-foreground/30'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : (
                    <span className="font-serif italic">{step}</span>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-medium hidden sm:block ${
                  step <= currentStep ? 'text-foreground' : 'text-foreground/30'
                }`}>
                  {step === 1 && 'Resort'}
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
          <div className="space-y-10">
            <div className="flex items-center gap-4 text-primary/40">
              <Home className="w-10 h-10" />
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div>
              <h2 className="text-4xl font-serif text-foreground mb-3">Resort <span className="italic text-primary">Identity</span></h2>
              <p className="text-foreground/50 font-light text-lg">Define the essence of your luxury hospitality experience.</p>
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

            <div className="group border-2 border-dashed border-border/50 rounded-2xl p-16 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer duration-500">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-foreground mb-2">Archive Intelligence</h3>
              <p className="text-foreground/50 font-light mb-6">Drop PDFs, guides, or policies to train your bespoke concierge.</p>
              <Button variant="outline" className="rounded-full px-8 pointer-events-none">SELECT DOCUMENTS</Button>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/10 border border-border/50 italic font-serif text-foreground/60 leading-relaxed">
              &quot;The secret of hospitality is to make guests feel at home even when you wish they were.&quot; 
              <span className="block not-italic font-sans text-xs uppercase tracking-widest mt-4 font-bold text-foreground/40">— Curation Tip: Upload thorough policy documents for precise AI responses.</span>
            </div>
          </div>
        )}

        {/* Step 5: Finish */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-10 text-primary">
                <Sparkles className="w-12 h-12" />
              </div>
              <h2 className="text-5xl font-serif text-foreground mb-6">Your Presence is <span className="italic">Infinite</span></h2>
              <p className="text-xl text-foreground/50 max-w-lg mx-auto font-light leading-relaxed">
                Your bespoke AI concierge is fully orchestrated and ready to welcome guests with unparalleled grace.
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
        <div className="mt-16 flex justify-between border-t border-border/50 pt-10">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="rounded-full px-8 text-foreground/40 hover:text-foreground transition-colors"
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> RETURN
          </Button>

          <Button
            onClick={handleNext}
            className="rounded-full px-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 tracking-widest font-bold text-xs"
            disabled={!canProceed()}
          >
            {currentStep === 5 ? 'ENTER ORCHESTRATION PANEL' : 'CONTINUE JOURNEY'} <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
