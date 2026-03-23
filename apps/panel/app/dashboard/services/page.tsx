'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { BedDouble, Plus, Settings2, Trash2, CheckCircle2 } from 'lucide-react'

const initialServices = [
  { id: 1, name: 'Spa & Wellness', available: true },
  { id: 2, name: 'Fine Dining', available: true },
  { id: 3, name: 'Activities & Tours', available: true },
  { id: 4, name: 'Room Service', available: true },
  { id: 5, name: 'Concierge Desk', available: true },
]

const initialRooms = [
  { id: 1, type: 'Standard Room', price: 150, available: 12 },
  { id: 2, type: 'Deluxe Room', price: 250, available: 8 },
  { id: 3, type: 'Suite', price: 450, available: 3 },
  { id: 4, type: 'Presidential Suite', price: 800, available: 1 },
]

export default function ServicesPage() {
  const [services] = useState(initialServices)
  const [rooms] = useState(initialRooms)

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Services & Rooms"
          subtitle="Manage your resort's services and room inventory"
        />

        <div className="p-8 space-y-8">
          {/* Services Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-foreground">Orchestrated Services</h2>
              <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10">
                <Plus className="w-4 h-4 mr-2" /> CREATE SERVICE
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Service Name</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Status</th>
                    <th className="px-4 py-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {services.map((service) => (
                      <tr key={service.id} className="group hover:bg-secondary/20 transition-all duration-300">
                        <td className="px-6 py-5 font-serif text-lg text-foreground">{service.name}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                            <CheckCircle2 className="w-3 h-3" /> Available
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-full hover:bg-primary/10 text-foreground/40 hover:text-primary transition-all">
                              <Settings2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-destructive/10 text-foreground/40 hover:text-destructive transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rooms Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Room Types</h2>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                + Add Room Type
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="rounded-lg border border-border/50 p-6 hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-serif text-foreground">{room.type}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mt-2">{room.available} ROOMS VACANT</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <BedDouble className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/70">Price per Night</span>
                      <span className="font-medium text-foreground">${room.price}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-sm text-foreground/70">Occupancy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-primary/20 rounded-full overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(room.available / 15) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground/70">{Math.round((room.available / 15) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 rounded transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
