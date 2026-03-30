'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight, ChevronLeft, Upload, Check } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId, getTenantResortName } from '@/lib/tenant'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    resortName: '',
    description: '',
    location: '',
    services: [] as string[],
    rooms: [] as { type: string; price: string; availableCount: string }[],
    files: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const isBusy = saving || uploading

  useEffect(() => {
    const resortName = getTenantResortName()
    if (resortName) {
      setFormData(prev => ({ ...prev, resortName }))
    }
  }, [])

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
      rooms: [...formData.rooms, { type: '', price: '', availableCount: '' }],
    })
  }

  const updateRoom = (index: number, field: string, value: string) => {
    const newRooms = [...formData.rooms]
    newRooms[index] = { ...newRooms[index], [field]: value }
    setFormData({ ...formData, rooms: newRooms })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const hotelId = getTenantHotelId()
    if (!hotelId) {
      toast.error('Session expired', {
        description: 'Please refresh the page and sign in again.',
      })
      return
    }

    setUploading(true)
    
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      
      await apiFetch(`/api/knowledge/upload?hotel_id=${encodeURIComponent(hotelId)}`, {
        method: 'POST',
        body: uploadData,
      })
      
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, file.name]
      }))
    } catch (err) {
      toast.error('Upload failed', {
        description:
          err instanceof Error
            ? err.message
            : 'We could not upload your document. Please try again.',
      })
    } finally {
      setUploading(false)
    }
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

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      const hotelId = getTenantHotelId()
      if (!hotelId) {
        toast.error('Session missing', {
          description: 'No resort session was found. Please sign up again.',
        })
        router.push('/signup')
        return
      }

      setSaving(true)
      try {
        await apiFetch(`/api/settings?hotel_id=${encodeURIComponent(hotelId)}`, {
          method: 'PUT',
          bodyJson: {
            resort_name: formData.resortName,
            description: formData.description,
            location: formData.location,
            is_onboarded: true,
          },
        })

        if (formData.services.length > 0) {
          const serviceData = formData.services.map((service) => `${service}, true`).join('\n')
          await apiFetch(`/api/services/bulk?hotel_id=${encodeURIComponent(hotelId)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: serviceData,
          })
        }

        if (formData.rooms.length > 0) {
          const roomData = formData.rooms
            .filter((room) => room.type && room.price)
            .map((room) => `${room.type}, ${Number(room.price) || 0}, ${Number(room.availableCount) || 1}`)
            .join('\n')
          if (roomData) {
            await apiFetch(`/api/rooms/bulk?hotel_id=${encodeURIComponent(hotelId)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: roomData,
            })
          }
        }

        router.push('/dashboard')
      } catch (err) {
        toast.error('Onboarding incomplete', {
          description:
            err instanceof Error
              ? err.message
              : 'We could not complete onboarding. Please try again.',
        })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20 dark:bg-zinc-50 dark:text-zinc-900" style={{ zoom: 1.1 }}>
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-8 py-5 flex items-center justify-between">
            <span className="font-bold tracking-tight uppercase">ZURI</span>
            <span className="text-sm font-medium text-zinc-400">Step {currentStep} of 5</span>
        </div>
      </header>

      {/* Progress Bar Container */}
      <div className="mx-auto max-w-2xl px-8 pt-12 pb-8">
        <div className="flex justify-between items-center relative z-10">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center gap-2 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors duration-300 z-10 ${
                  step === currentStep
                    ? 'bg-zinc-900 text-white'
                    : step < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
            </div>
          ))}
          {/* Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 -z-0">
             <div 
               className="h-full bg-emerald-500 transition-all duration-500"
               style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
             />
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-xl px-8 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 sm:p-12 mt-4">
        {/* Step 1: Resort Info */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Property Details</h2>
              <p className="text-zinc-500 text-sm">Tell us about your property to configure your widget.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="resortName" className="text-sm font-medium text-zinc-700">Property Name *</Label>
                <input
                  id="resortName"
                  name="resortName"
                  placeholder="e.g. Grand Ocean Resort"
                  value={formData.resortName}
                  onChange={handleInputChange}
                  disabled={isBusy}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-zinc-700">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe your property and its unique features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isBusy}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-medium text-zinc-700">Location *</Label>
                <input
                  id="location"
                  name="location"
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={isBusy}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Services & Amenities</h2>
              <p className="text-zinc-500 text-sm">Select the services your property offers.</p>
            </div>

            <div className="space-y-3">
              {['Spa & Wellness', 'Fine Dining', 'Activities & Tours', 'Room Service', 'Concierge Desk', 'Event Planning', 'Airport Transfer'].map(
                (service) => (
                  <label key={service} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50">
                    <Checkbox
                      id={service}
                      checked={formData.services.includes(service)}
                      onCheckedChange={() => handleServiceChange(service)}
                      disabled={isBusy}
                      className="data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white border-zinc-300 dark:border-zinc-300 dark:bg-white"
                    />
                    <span className="font-medium text-sm text-zinc-800">
                      {service}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 3: Rooms */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Room Categories</h2>
              <p className="text-zinc-500 text-sm">Define your available room types, pricing, and availability.</p>
            </div>

            <div className="space-y-5">
              {formData.rooms.map((room, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Room Type</Label>
                    <input
                      placeholder="e.g. Deluxe Suite"
                      value={room.type}
                      onChange={(e) => updateRoom(index, 'type', e.target.value)}
                      disabled={isBusy}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Price / Night</Label>
                    <input
                      placeholder="e.g. 250"
                      value={room.price}
                      type="number"
                      onChange={(e) => updateRoom(index, 'price', e.target.value)}
                      disabled={isBusy}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Vacant Rooms</Label>
                    <input
                      placeholder="e.g. 5"
                      value={room.availableCount}
                      type="number"
                      min="0"
                      onChange={(e) => updateRoom(index, 'availableCount', e.target.value)}
                      disabled={isBusy}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all font-sans"
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={addRoom}
                variant="outline"
                disabled={isBusy}
                className="w-full border-dashed border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 h-12"
              >
                + Add Room Type
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Knowledge Upload */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Train Your Widget</h2>
              <p className="text-zinc-500 text-sm">Upload property guides to train your AI.</p>
            </div>

            <label className="border-2 border-dashed border-zinc-200 rounded-xl p-10 text-center hover:border-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer flex flex-col items-center">
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-500">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 mb-1">
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </h3>
              <p className="text-zinc-500 text-xs mb-6 max-w-[200px]">PDF, DOCX, or TXT up to 10MB</p>
              <Button size="sm" variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 pointer-events-none" disabled={uploading}>
                Select Files
              </Button>
            </label>

            {formData.files.length > 0 && (
              <div className="mt-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <h4 className="text-sm font-medium text-zinc-900 mb-2">Uploaded Files:</h4>
                <ul className="text-sm text-zinc-600 space-y-1">
                  {formData.files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                       <Check className="w-4 h-4 text-emerald-500" />
                       {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3 text-sm text-blue-800">
              <div className="mt-0.5">ℹ️</div>
              <p>For best results, upload your complete FAQ document, dining menus, and hotel policies. The AI widget will use this to accurately assist guests.</p>
            </div>
          </div>
        )}

        {/* Step 5: Finish */}
        {currentStep === 5 && (
          <div className="space-y-8 text-center py-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600">
               <Check className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-3xl font-semibold text-zinc-900 mb-4">Setup Complete</h2>
              <p className="text-zinc-500 leading-relaxed max-w-sm mx-auto">
                Your Zuri account is ready. Your AI widget has been configured with your property data and is prepared to assist guests.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-between pt-6 border-t border-zinc-100">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            disabled={currentStep === 1 || isBusy}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <Button
            onClick={handleNext}
            className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 font-medium"
            disabled={!canProceed() || isBusy}
          >
            {currentStep === 5 ? (saving ? 'Saving...' : 'Go to Dashboard') : 'Continue'} 
            {currentStep !== 5 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
