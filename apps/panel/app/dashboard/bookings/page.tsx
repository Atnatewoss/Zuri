'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { CheckCircle2, Clock, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'
import { toast } from 'sonner'

// No dummy data fallback for production
type BookingItem = {
  id: number
  guest_name: string
  service: string
  date: string
  time: string
  status: string
}

export default function BookingsPage() {
  const [bookingsList, setBookingsList] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      try {
        const hotelId = getTenantHotelId()
        if (!hotelId) return

        const data = await apiFetch<BookingItem[]>(`/api/bookings?hotel_id=${encodeURIComponent(hotelId)}`)
        setBookingsList(data || [])
      } catch (error) {
        console.error("Failed to load bookings", error)
        toast.error('Unable to load bookings', {
          description:
            error instanceof Error
              ? error.message
              : 'We could not load bookings right now. Please try again.',
        })
        setBookingsList([])
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto flex flex-col relative w-full h-screen">
        <DashboardHeader
          title="Bookings"
          subtitle="View and manage all guest bookings and reservations"
        />

        <div className="flex-1 p-8 md:p-12 lg:px-20 max-w-[1600px] w-full mx-auto pb-32">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-foreground">Recent Bookings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Guest Name</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Service / Room</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Date</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Time</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Status</th>
                    <th className="px-4 py-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 text-sm italic">
                          Loading bookings...
                        </td>
                      </tr>
                    ) : bookingsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center">
                            <Clock className="w-8 h-8 text-zinc-300 mb-3" />
                            <p className="text-sm font-medium">No bookings found</p>
                            <p className="text-xs text-zinc-400 mt-1">When guests make reservations, they will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    ) : bookingsList.map((booking) => {
                      const guestName = booking.guest_name || 'Guest';
                      return (
                      <tr key={booking.id} className="group hover:bg-secondary/20 transition-all duration-300">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-serif italic text-primary border border-primary/20">
                              {guestName ? guestName[0] : '?'}
                            </div>
                            <span className="font-serif text-lg text-foreground">{guestName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-foreground/60">{booking.service}</td>
                        <td className="px-6 py-5 text-sm text-foreground/40 font-light tracking-wide">{booking.date?.toUpperCase()}</td>
                        <td className="px-6 py-5 text-sm text-foreground/40 font-light tracking-wide">{booking.time?.toUpperCase()}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              booking.status === 'Confirmed'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-muted text-foreground/40 border border-border/50'
                            }`}
                          >
                            {booking.status === 'Confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 rounded-full hover:bg-primary/10 text-foreground/40 hover:text-primary transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
