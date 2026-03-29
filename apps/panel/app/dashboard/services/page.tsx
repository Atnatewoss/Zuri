'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef, useEffect } from 'react'
import { BedDouble, Plus, Trash2, Edit2, MoreHorizontal, Settings, X, PlusCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'


export default function ServicesPage() {
  const [tabs, setTabs] = useState<any[]>([])
  const [activeTabId, setActiveTabId] = useState<number | null>(null)
  const [roomsList, setRoomsList] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTabName, setNewTabName] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const hotelId = getTenantHotelId()
      if (!hotelId) return

      const [servicesData, roomsData] = await Promise.all([
        apiFetch<any[]>(`/api/services?hotel_id=${encodeURIComponent(hotelId)}`),
        apiFetch<any[]>(`/api/rooms?hotel_id=${encodeURIComponent(hotelId)}`)
      ])
      
      setTabs(servicesData || [])
      if (servicesData && servicesData.length > 0 && activeTabId === null) {
        setActiveTabId(servicesData[0].id)
      }
      
      setRoomsList(roomsData || [])
    } catch (error) {
      console.error("Failed to load services and rooms data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateTab = async () => {
    if (!newTabName.trim()) return
    setIsSubmitting(true)
    try {
      const hotelId = getTenantHotelId()
      const result = await apiFetch<any>('/api/services', {
        method: 'POST',
        bodyJson: {
          name: newTabName,
          available: true,
          hotel_id: hotelId
        }
      })
      setTabs([...tabs, result])
      setNewTabName('')
      if (tabs.length === 0) setActiveTabId(result.id)
    } catch (error) {
      console.error("Failed to create service category", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTab = async (id: number) => {
    if (!confirm("Are you sure? All data in this category will be inaccessible.")) return
    try {
      await apiFetch(`/api/services/${id}`, { method: 'DELETE' })
      const updated = tabs.filter(t => t.id !== id)
      setTabs(updated)
      if (activeTabId === id) {
        setActiveTabId(updated.length > 0 ? updated[0].id : null)
      }
    } catch (error) {
      console.error("Failed to delete service category", error)
    }
  }
  
  // Custom scrolling ref for tabs
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeTabName = tabs.find((t) => t.id === activeTabId)?.name || ''

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto flex flex-col relative w-full h-screen">
        <DashboardHeader
          title="Resort Services"
          subtitle="Manage your distinct property offerings and categories"
        />

        <div className="flex-1 p-8 md:p-12 lg:px-20 flex flex-col gap-8 max-w-[1600px] w-full mx-auto pb-32">
          
          {/* Horizontal Tabs Bar */}
          <div className="relative flex items-center w-full border-b border-zinc-200">
            {/* The scrollable area with a right-fade mask */}
            <div 
              className="flex-1 overflow-x-auto no-scrollbar"
              style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
              ref={scrollRef}
            >
              <div className="flex items-center gap-1 pb-4 min-w-max pr-12">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-foreground text-background shadow-md scale-100' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted scale-95 hover:scale-100'
                      }`}
                    >
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* The right-edge Edit Button */}
            <div className="pl-4 pb-4 border-l border-border ml-2 shadow-[-10px_0_15px_-5px_var(--color-background)] bg-background z-10 flex-shrink-0 flex items-center">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Manage Tabs
              </button>
            </div>
          </div>

          {/* Bottom Dynamic Content Area */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {loading ? (
                <div className="space-y-8 animate-pulse p-12">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="h-8 w-48 bg-muted rounded-md"></div>
                       <div className="h-4 w-96 bg-muted/50 rounded-md mt-4"></div>
                     </div>
                     <div className="h-10 w-32 bg-muted rounded-full"></div>
                   </div>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="h-48 rounded-2xl bg-muted/30 border border-border"></div>
                     ))}
                   </div>
                </div>
             ) : tabs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-20 text-center text-muted-foreground min-h-[400px]">
                  <h3 className="text-xl font-medium text-foreground mb-2">No categories configured</h3>
                  <p className="max-w-sm mx-auto text-sm leading-relaxed">Click "Manage Tabs" or use the AI Generator to populate your services.</p>
                  <Button onClick={() => setIsEditModalOpen(true)} className="mt-4">Setup Categories</Button>
                </div>
             ) : activeTabName === 'Room Service' || activeTabName.toLowerCase().includes('room') ? (
                <RoomServiceContent rooms={roomsList} onUpdate={loadData} />
             ) : (
                <GenericServiceContent serviceName={activeTabName} />
             )}
          </div>
          
        </div>
      </div>

      {/* Senior CRUD Modal overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-border">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-xl font-medium text-card-foreground">Manage Categories</h3>
                <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove top-level service tabs.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-muted/10">
              {tabs.map((tab) => (
                <div key={tab.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 pr-4 shadow-sm group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-sm font-medium text-card-foreground px-0 outline-none">
                    {tab.name}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteTab(tab.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
                <input 
                  type="text"
                  placeholder="New category name..."
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm font-medium text-card-foreground focus:ring-0 px-2 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTab()}
                />
                <Button 
                  onClick={handleCreateTab}
                  disabled={isSubmitting || !newTabName.trim()}
                  className="h-9 px-4 rounded-lg bg-foreground text-background hover:bg-foreground/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
            
            <div className="p-5 border-t border-border bg-card flex justify-end gap-3">
              <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={() => setIsEditModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function RoomServiceContent({ rooms, onUpdate }: { rooms: any[], onUpdate: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    price: '',
    available_count: ''
  })

  const handleOpenCreate = () => {
    setEditingRoom(null)
    setFormData({ type: '', price: '', available_count: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (room: any) => {
    setEditingRoom(room)
    setFormData({ 
      type: room.type, 
      price: room.price.toString(), 
      available_count: (room.available_count !== undefined ? room.available_count : room.available).toString()
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const hotelId = getTenantHotelId()
      const payload = {
        type: formData.type,
        price: parseFloat(formData.price),
        available_count: parseInt(formData.available_count),
        hotel_id: hotelId
      }

      if (editingRoom) {
        await apiFetch(`/api/rooms/${editingRoom.id}`, {
          method: 'PUT',
          bodyJson: payload
        })
      } else {
        await apiFetch('/api/rooms', {
          method: 'POST',
          bodyJson: payload
        })
      }
      setIsModalOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to save room", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this room type?")) return
    try {
      await apiFetch(`/api/rooms/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error("Failed to delete room", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-foreground">Room Portfolio</h2>
          <p className="text-muted-foreground mt-2">Manage physical room amenities, pricing, and specific traits.</p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" /> CREATE ROOM
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium text-card-foreground">{room.type}</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {room.available_count !== undefined ? room.available_count : room.available} VACANT
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
                  <BedDouble className="w-6 h-6" />
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Nightly Rate</span>
                  <span className="text-lg font-semibold text-card-foreground">${room.price}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => handleOpenEdit(room)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Details
                </button>
                <button 
                  onClick={() => handleDelete(room.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-border">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-xl font-medium text-card-foreground">
                {editingRoom ? 'Edit Room Type' : 'Create New Room Type'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Room Type Name</Label>
                <Input 
                  id="type"
                  placeholder="e.g. Deluxe Ocean Suite" 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (per night)</Label>
                  <Input 
                    id="price"
                    type="number" 
                    placeholder="350" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">Availability Count</Label>
                  <Input 
                    id="count"
                    type="number" 
                    placeholder="5" 
                    value={formData.available_count} 
                    onChange={(e) => setFormData({...formData, available_count: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90">
                {isSubmitting ? 'Saving...' : 'Save Room Type'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function GenericServiceContent({ serviceName }: { serviceName: string }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-foreground">{serviceName} Catalog</h2>
          <p className="text-muted-foreground mt-2">Add specific bookable items, internal menus, or policies for {serviceName}.</p>
        </div>
        <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-black/10">
          <Plus className="w-4 h-4 mr-2" /> ADD ITEM
        </Button>
      </div>
      
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-20 text-center text-muted-foreground min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-6">
          <Plus className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No items configured</h3>
        <p className="max-w-sm mx-auto text-sm leading-relaxed">You haven't added any specific assets into the {serviceName} tab yet. Add items so the AI concierge can recommend them.</p>
        <Button className="mt-6 bg-card border border-border text-card-foreground hover:bg-muted shadow-sm">Create First Item</Button>
      </div>
    </div>
  )
}

