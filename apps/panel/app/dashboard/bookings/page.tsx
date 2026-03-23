'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { CheckCircle2, Clock, Eye, MoreHorizontal } from 'lucide-react'

const bookings = [
  {
    id: 1,
    guestName: 'Sarah Johnson',
    service: 'Spa - Full Body Massage',
    date: 'Mar 25, 2026',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    id: 2,
    guestName: 'Michael Chen',
    service: 'Fine Dining - 8 PM Seating',
    date: 'Mar 25, 2026',
    time: '8:00 PM',
    status: 'Confirmed',
  },
  {
    id: 3,
    guestName: 'Emma Williams',
    service: 'Mountain Hiking Tour',
    date: 'Mar 26, 2026',
    time: '7:00 AM',
    status: 'Confirmed',
  },
  {
    id: 4,
    guestName: 'David Martinez',
    service: 'Room Service - Breakfast',
    date: 'Mar 25, 2026',
    time: '7:30 AM',
    status: 'Pending',
  },
  {
    id: 5,
    guestName: 'Lisa Anderson',
    service: 'Airport Transfer',
    date: 'Mar 27, 2026',
    time: '2:00 PM',
    status: 'Confirmed',
  },
  {
    id: 6,
    guestName: 'James Thompson',
    service: 'Wellness Class - Yoga',
    date: 'Mar 26, 2026',
    time: '6:00 AM',
    status: 'Pending',
  },
]

export default function BookingsPage() {
  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Bookings"
          subtitle="View and manage all guest bookings and reservations"
        />

        <div className="p-8">
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
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="group hover:bg-secondary/20 transition-all duration-300">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-serif italic text-primary border border-primary/20">
                              {booking.guestName[0]}
                            </div>
                            <span className="font-serif text-lg text-foreground">{booking.guestName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-foreground/60">{booking.service}</td>
                        <td className="px-6 py-5 text-sm text-foreground/40 font-light tracking-wide">{booking.date.toUpperCase()}</td>
                        <td className="px-6 py-5 text-sm text-foreground/40 font-light tracking-wide">{booking.time.toUpperCase()}</td>
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
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
