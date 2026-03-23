'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, Users, MessageSquare, Clock, User } from 'lucide-react'

const chartData = [
  { name: 'Mon', conversations: 12, bookings: 8 },
  { name: 'Tue', conversations: 19, bookings: 12 },
  { name: 'Wed', conversations: 15, bookings: 10 },
  { name: 'Thu', conversations: 25, bookings: 18 },
  { name: 'Fri', conversations: 22, bookings: 15 },
  { name: 'Sat', conversations: 30, bookings: 24 },
  { name: 'Sun', conversations: 28, bookings: 22 },
]

const recentActivity = [
  {
    id: 1,
    user: 'Guest in Room 302',
    action: 'Booked spa session',
    time: '2 hours ago',
  },
  {
    id: 2,
    user: 'Guest in Room 415',
    action: 'Requested dinner reservation',
    time: '3 hours ago',
  },
  {
    id: 3,
    user: 'Guest in Room 201',
    action: 'Asked about hiking tours',
    time: '5 hours ago',
  },
  {
    id: 4,
    user: 'Guest in Room 520',
    action: 'Booked airport transportation',
    time: '6 hours ago',
  },
  {
    id: 5,
    user: 'Guest in Room 308',
    action: 'Requested room service',
    time: '7 hours ago',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex bg-background min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto w-full">
        <DashboardHeader
          title="Dashboard"
          subtitle="Welcome back to your AI Concierge"
        />

        <div className="p-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Bookings */}
            <div className="group rounded-2xl border border-border/50 bg-card p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">Total Bookings</p>
                  <p className="text-5xl font-serif text-foreground mt-4">247</p>
                  <p className="text-xs text-primary mt-3 font-medium">+12% vs last week</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Active Guests */}
            <div className="group rounded-2xl border border-border/50 bg-card p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">Active Guests</p>
                  <p className="text-5xl font-serif text-foreground mt-4">84</p>
                  <p className="text-xs text-primary mt-3 font-medium">12 new check-ins today</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* AI Conversations Today */}
            <div className="group rounded-2xl border border-border/50 bg-card p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">AI Interactions</p>
                  <p className="text-5xl font-serif text-foreground mt-4">156</p>
                  <p className="text-xs text-primary mt-3 font-medium">REAL-TIME SUPPORT</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Activity This Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Line type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)' }} />
                <Line type="monotone" dataKey="bookings" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-8">
            <h2 className="text-2xl font-serif text-foreground mb-8">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-secondary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-serif text-lg text-foreground">{activity.user}</p>
                      <p className="text-sm text-foreground/50">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-medium">
                    <Clock className="w-3 h-3" />
                    {activity.time.toUpperCase()}
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
