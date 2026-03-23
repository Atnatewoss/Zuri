'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'

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
                    <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-foreground">
                            {booking.guestName[0]}
                          </div>
                          <span className="font-medium text-foreground">{booking.guestName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{booking.service}</td>
                      <td className="px-4 py-4 text-sm text-foreground/70">{booking.date}</td>
                      <td className="px-4 py-4 text-sm text-foreground/70">{booking.time}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'Confirmed'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground/70'
                          }`}
                        >
                          {booking.status === 'Confirmed' ? '✓' : '⏳'} {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-sm text-foreground/70 hover:text-foreground font-medium transition-colors">
                          View
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
