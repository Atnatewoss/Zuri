'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, ShieldCheck, Zap, ArrowUpRight, MessageSquare, User, Clock } from 'lucide-react'

const chartData = [
  { name: '00:00', request: 420, latency: 42 },
  { name: '04:00', request: 380, latency: 40 },
  { name: '08:00', request: 850, latency: 45 },
  { name: '12:00', request: 1284, latency: 48 },
  { name: '16:00', request: 940, latency: 44 },
  { name: '20:00', request: 1100, latency: 46 },
  { name: '23:59', request: 720, latency: 43 },
]

const recentActivity = [
  { id: 1, user: 'Dr. Aris Thorne', action: 'Support: Suite Preference Request', time: '2m ago' },
  { id: 2, user: 'Elena Rossi', action: 'Service: Sunset Cruise Coordination', time: '15m ago' },
  { id: 3, user: 'Marcus Chen', action: 'Resolution: Dietary Preference Confirmed', time: '1h ago' },
]

export default function DashboardPage() {
  return (
    <div className="flex bg-background min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto w-full">
        <DashboardHeader
          title="Resort Command Center"
          subtitle="Real-time Guest Support & Management"
        />

        <div className="p-10 space-y-10 w-full">
          {/* KPI Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Request Volume */}
            <div className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Total Guest Requests</p>
              <h3 className="text-5xl font-serif text-foreground mt-4 tracking-tighter">1,284</h3>
              <p className="text-xs text-emerald-500 mt-4 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +18.4% ACTIVITY
              </p>
            </div>

            {/* Staff Efficiency */}
            <div className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Staff Hours Reclaimed</p>
              <h3 className="text-5xl font-serif text-foreground mt-4 tracking-tighter">128h</h3>
              <p className="text-xs text-foreground/40 mt-4 font-light italic">Efficiency Optimized</p>
            </div>

            {/* Guest Satisfaction */}
            <div className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Guest Satisfaction</p>
              <h3 className="text-5xl font-serif text-foreground mt-4 tracking-tighter">98.2%</h3>
              <p className="text-xs text-foreground/40 mt-4 font-light italic">Positive Sentiment</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="rounded-3xl border border-border bg-card p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-48 h-48 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-serif text-foreground">Guest Activity</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Guest Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Resolved</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.2} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--foreground)" opacity={0.2} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--border)`,
                    borderRadius: '16px',
                    color: 'var(--foreground)',
                    fontFamily: 'serif',
                  }}
                />
                <Line type="monotone" dataKey="request" stroke="var(--primary)" strokeWidth={3} dot={false} name="Total Requests" />
                <Line type="monotone" dataKey="latency" stroke="var(--accent)" strokeWidth={3} dot={false} name="Resolved Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resolutions */}
          <div className="rounded-3xl border border-border bg-card p-10">
            <h2 className="text-3xl font-serif text-foreground mb-10">Recent Resolutions</h2>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-6 rounded-2xl border border-border/50 hover:bg-secondary/10 transition-all duration-500 group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 border border-primary/10">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-foreground mb-1">{activity.user}</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-bold">Action: {activity.action.split(': ')[1] || activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-foreground/20 font-bold tracking-widest">
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
