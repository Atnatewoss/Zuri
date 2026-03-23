'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Bookings */}
            <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Total Bookings</p>
                  <p className="text-4xl font-light text-foreground mt-2">247</p>
                  <p className="text-xs text-primary mt-2">+12% vs last week</p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </div>

            {/* Active Guests */}
            <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Active Guests</p>
                  <p className="text-4xl font-light text-foreground mt-2">84</p>
                  <p className="text-xs text-primary mt-2">12 new check-ins today</p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
            </div>

            {/* AI Conversations Today */}
            <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">AI Conversations</p>
                  <p className="text-4xl font-light text-foreground mt-2">156</p>
                  <p className="text-xs text-primary mt-2">Today</p>
                </div>
                <span className="text-3xl">💬</span>
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
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-secondary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-foreground">
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.user}</p>
                      <p className="text-sm text-foreground/70">{activity.action}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/60">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
