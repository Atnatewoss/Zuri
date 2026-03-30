'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUp, ArrowDown, Settings } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { clearAuth, getTenantHotelId } from '@/lib/tenant'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RecentInteraction {
  id: number
  title: string
  description: string
  channel: string
  status: string
  created_at: string
}

interface ChartDataPoint {
  name: string
  request: number
}

interface DashboardStats {
  total_requests: number
  resolved_requests: number
  staff_hours_reclaimed: string
  satisfaction_score: string
  total_documents: number
  documents_ready: number
  request_change_percent: number
  automation_change_percent: number
  reclaimed_change_percent: number
  recent_interactions: RecentInteraction[]
  resort_name: string
  admin_email: string
  chart_data: ChartDataPoint[]
  is_onboarded: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  useEffect(() => {
    async function loadStats() {
      const hotelId = getTenantHotelId()
      if (!hotelId) {
        router.push('/login')
        return
      }

      try {
        const data = await apiFetch<DashboardStats>(`/api/dashboard/stats?hotel_id=${hotelId}`)
        if (!data.is_onboarded) {
          router.push('/onboarding')
          return
        }
        if (!data.resort_name?.trim() || !data.admin_email?.trim()) {
          clearAuth()
          toast.error('Session invalid', {
            description: 'Your resort profile is incomplete. Please sign in again.',
          })
          router.push('/login')
          return
        }
        setStats(data)
      } catch (error) {
        toast.error('Unable to load dashboard', {
          description:
            error instanceof Error
              ? error.message
              : 'We could not load your dashboard right now. Please try again.',
        })
        clearAuth()
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="flex bg-background min-h-screen font-sans text-foreground">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 bg-background shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <DashboardHeader 
          title="Executive Dashboard" 
          subtitle="Manage guest experiences, bookings, and platform integrations." 
          resortName={stats?.resort_name}
          adminEmail={stats?.admin_email}
          loading={loading}
        />

        <div className="flex-1 overflow-auto w-full p-8 md:p-12 lg:px-20 mx-auto max-w-[1600px]">
          
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-36 border-t-4 border-t-primary/80">
               <h3 className="text-sm font-medium text-muted-foreground">Total Guest Requests</h3>
               <div>
                  <div className="text-3xl font-semibold text-card-foreground mb-2">
                    {loading ? '...' : (stats?.total_requests?.toLocaleString() || '0')}
                  </div>
                  {(!loading && stats) ? (
                    stats.request_change_percent > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                         <ArrowUp className="w-3 h-3" /> {stats.request_change_percent}% vs last month
                      </div>
                    ) : stats.request_change_percent < 0 ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded">
                         <ArrowDown className="w-3 h-3" /> {Math.abs(stats.request_change_percent)}% vs last month
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 w-fit px-2 py-0.5 rounded">
                         Initial Phase
                      </div>
                    )
                  ) : null}
               </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-36">
               <h3 className="text-sm font-medium text-muted-foreground">Concierge Automations</h3>
               <div>
                  <div className="text-3xl font-semibold text-card-foreground mb-2">
                    {loading ? '...' : (stats?.resolved_requests?.toLocaleString() || '0')}
                  </div>
                  {(!loading && stats) ? (
                    stats.automation_change_percent > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                         <ArrowUp className="w-3 h-3" /> {stats.automation_change_percent}% vs last month
                      </div>
                    ) : stats.automation_change_percent < 0 ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded">
                         <ArrowDown className="w-3 h-3" /> {Math.abs(stats.automation_change_percent)}% vs last month
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 w-fit px-2 py-0.5 rounded">
                         Initial Phase
                      </div>
                    )
                  ) : null}
               </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-36">
               <h3 className="text-sm font-medium text-muted-foreground">Staff Hours Reclaimed</h3>
               <div>
                  <div className="text-3xl font-semibold text-card-foreground mb-2">
                    {loading ? '...' : (stats?.staff_hours_reclaimed || '0h')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded">
                     <span className="w-3 h-3 flex items-center justify-center">-</span> Operational Check
                  </div>
               </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-card border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
             <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
               <h3 className="text-sm font-medium text-card-foreground">Guest Engagement Journey</h3>
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"><Settings className="w-4 h-4"/></Button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="h-[300px] w-full flex items-end gap-4 pb-8 pt-10 px-8">
                  {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-muted rounded-t-lg animate-pulse" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.chart_data || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 500, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
                        itemStyle={{ color: 'var(--card-foreground)' }}
                        labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                        cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="request" 
                        stroke="var(--primary)" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} 
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
             <div className="grid grid-cols-4 border-b border-border bg-muted/50 px-6 py-3">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider col-span-2">Recent Interactions</div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Channel</div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Status</div>
             </div>
             
             {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm italic">Loading interactions...</div>
             ) : (!stats?.recent_interactions || stats.recent_interactions.length === 0) ? (
                <div className="p-12 text-center text-muted-foreground">
                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                      <Settings className="w-6 h-6 text-muted-foreground animate-pulse" />
                   </div>
                   <p className="text-sm font-medium text-foreground">No recent guest interactions found.</p>
                   <p className="text-xs mt-1 text-muted-foreground">Deploy the widget to start collecting data.</p>
                </div>
             ) : stats.recent_interactions.map((interaction) => (
                <div key={interaction.id} className="grid grid-cols-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center">
                    <div className="flex flex-col col-span-2">
                      <span className="font-medium text-sm text-card-foreground">{interaction.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{interaction.description}</span>
                    </div>
                    <div className="text-right text-xs font-medium text-muted-foreground">{interaction.channel}</div>
                    <div className="text-right flex justify-end">
                      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">
                          {interaction.status}
                      </div>
                    </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
