'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUp, ChevronDown, Calendar, Search, Bell, Settings, LogOut, User } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  total_requests: number
  resolved_requests: number
  staff_hours_reclaimed: string
  satisfaction_score: string
  total_documents: number
  documents_ready: number
}

const chartData = [
  { name: '01 Oct', request: 0 },
  { name: '05 Oct', request: 12 },
  { name: '10 Oct', request: 45 },
  { name: '15 Oct', request: 30 },
  { name: '20 Oct', request: 85 },
  { name: '25 Oct', request: 65 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    async function loadStats() {
      const hotelId = getTenantHotelId()
      if (!hotelId) return

      try {
        const data = await apiFetch<DashboardStats>(`/api/dashboard/stats?hotel_id=${hotelId}`)
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans text-zinc-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-zinc-200 flex items-center justify-end px-6 bg-white gap-4 sticky top-0 z-20">
           <div className="flex items-center gap-3 text-zinc-500">
              <div className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors"><Search className="w-4 h-4" /></div>
              <div className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors"><Bell className="w-4 h-4" /></div>
              
              {/* Profile Dropdown */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-8 h-8 border border-zinc-200 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-sans hover:ring-2 ring-primary/20 transition-all focus:outline-none"
                >
                  KR
                </button>
                
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 font-sans">
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-sm font-semibold text-zinc-900 truncate">Kuriftu Resort</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">admin@kuriftu.com</p>
                      </div>
                      <div className="py-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                           <User className="w-4 h-4 text-zinc-400" /> Account Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                           <Settings className="w-4 h-4 text-zinc-400" /> Preferences
                        </button>
                      </div>
                      <div className="border-t border-zinc-100 py-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                           <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
           </div>
        </header>

        {/* Main Content Setup matched to standard full-width layout `max-w-[1600px]` with deep side paddings */}
        <div className="flex-1 overflow-auto w-full p-8 md:p-12 lg:px-20 mx-auto max-w-[1600px]">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Executive Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage guest experiences, bookings, and platform integrations.</p>
            </div>
          </div>

          {/* Primary Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-200 mb-6">
            <button className="text-sm font-medium text-primary border-b-2 border-primary pb-4 px-1">
              Command Center
            </button>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 pb-4 px-1">
              Action Logs
            </button>
          </div>

          {/* Secondary Tabs */}
          <div className="flex items-center gap-6 mb-8 mt-4">
             <button className="text-sm font-semibold text-zinc-900 border-b border-zinc-900 leading-none pb-1">All Channels</button>
             <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 leading-none pb-1">Web Widget</button>
             <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 leading-none pb-1">Voice Systems</button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
             <Button variant="outline" className="h-9 px-3 border-zinc-200 bg-white text-zinc-700 shadow-sm flex gap-2 text-xs font-medium rounded-md hover:bg-zinc-50">
               All Interactions <ChevronDown className="w-3 h-3 opacity-50" />
             </Button>
             
             <div className="flex items-center gap-2 border border-zinc-200 bg-white px-3 h-9 rounded-md shadow-sm text-xs text-zinc-600 font-medium cursor-pointer hover:bg-zinc-50">
               <span>2026-03-01</span>
               <span className="text-zinc-300">→</span>
               <span>2026-03-31</span>
               <Calendar className="w-3.5 h-3.5 text-zinc-400 ml-2" />
             </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-36 border-t-4 border-t-primary/80">
               <h3 className="text-sm font-medium text-zinc-500">Total Guest Requests</h3>
               <div>
                  <div className="text-3xl font-semibold text-zinc-900 mb-2">
                    {loading ? '...' : (stats?.total_requests?.toLocaleString() || '1,284')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                     <ArrowUp className="w-3 h-3" /> 18.4% vs last month
                  </div>
               </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-36">
               <h3 className="text-sm font-medium text-zinc-500">Concierge Automations</h3>
               <div>
                  <div className="text-3xl font-semibold text-zinc-900 mb-2">
                    {loading ? '...' : (stats?.resolved_requests?.toLocaleString() || '432')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                     <ArrowUp className="w-3 h-3" /> 5.2% vs last month
                  </div>
               </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-36">
               <h3 className="text-sm font-medium text-zinc-500">Staff Hours Reclaimed</h3>
               <div>
                  <div className="text-3xl font-semibold text-zinc-900 mb-2">
                    {loading ? '...' : (stats?.staff_hours_reclaimed || '86h')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 w-fit px-2 py-0.5 rounded">
                     <span className="w-3 h-3 flex items-center justify-center">-</span> Operational Check
                  </div>
               </div>
            </div>

          </div>

          {/* Chart Section */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mb-8 overflow-hidden">
             <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
               <h3 className="text-sm font-medium text-zinc-800">Guest Engagement Journey</h3>
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600"><Settings className="w-4 h-4"/></Button>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 500, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
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
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden mb-8">
             <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50/50 px-6 py-3">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider col-span-2">Recent Interactions</div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Channel</div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Status</div>
             </div>
             
             <div className="grid grid-cols-4 px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors items-center">
                <div className="flex flex-col col-span-2">
                   <span className="font-medium text-sm text-zinc-900">Late Checkout Request</span>
                   <span className="text-xs text-zinc-500 truncate">Room 402 - Extended until 2:00 PM</span>
                </div>
                <div className="text-right text-xs font-medium text-zinc-600">Web Widget</div>
                <div className="text-right flex justify-end">
                   <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">Resolved</div>
                </div>
             </div>
             
             <div className="grid grid-cols-4 px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors items-center">
                <div className="flex flex-col col-span-2">
                   <span className="font-medium text-sm text-zinc-900">Spa Reservation</span>
                   <span className="text-xs text-zinc-500 truncate">Couples Massage - Friday 4:00 PM</span>
                </div>
                <div className="text-right text-xs font-medium text-zinc-600">Voice System</div>
                <div className="text-right flex justify-end">
                   <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">Resolved</div>
                </div>
             </div>
             
             <div className="grid grid-cols-4 px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors items-center">
                <div className="flex flex-col col-span-2">
                   <span className="font-medium text-sm text-zinc-900">Room Service Order</span>
                   <span className="text-xs text-zinc-500 truncate">Room 118 - Breakfast in Bed</span>
                </div>
                <div className="text-right text-xs font-medium text-zinc-600">Web Widget</div>
                <div className="text-right flex justify-end">
                   <div className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">Pending</div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
