'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'
import { toast } from 'sonner'

interface ResortInfo {
  hotelId: string
  resortName: string
  email: string
  description?: string
  location?: string
  allowedDomains?: string
}

interface ResortContextType {
  resort: ResortInfo | null
  loading: boolean
  error: Error | null
  refreshResort: () => Promise<void>
  resetResort: () => void
}

const ResortContext = createContext<ResortContextType | undefined>(undefined)

export function ResortProvider({ children }: { children: ReactNode }) {
  const [resort, setResort] = useState<ResortInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const pathname = usePathname()

  const loadResort = useCallback(async () => {
    const hotelId = getTenantHotelId()
    
    // Note: Middleware handles redirects to /login if hotelId is missing.
    // Here we just ensure the local state is cleared.
    if (!hotelId) {
      setResort(null)
      setLoading(false)
      return
    }

    // Performance: Avoid redundant fetches if data is already fresh
    if (resort && resort.hotelId === hotelId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<{
        resort_name: string
        email: string
        description?: string
        location?: string
        allowed_domains?: string
      }>(`/api/settings?hotel_id=${encodeURIComponent(hotelId)}`)

      setResort({
        hotelId,
        resortName: data.resort_name,
        email: data.email,
        description: data.description,
        location: data.location,
        allowedDomains: data.allowed_domains,
      })
      setError(null)
    } catch (err) {
      // Errors (including timeouts) are handled here. 
      // Auth errors (401/440) specifically trigger logout in apiFetch.
      console.error('Resort context fetch error:', err)
      setError(err instanceof Error ? err : new Error('Failed to load resort info'))
    } finally {
      setLoading(false)
    }
  }, [resort]) // re-run if resort state changes or is cleared

  useEffect(() => {
    loadResort()
  }, [loadResort, pathname])

  const refreshResort = useCallback(async () => {
    await loadResort()
  }, [loadResort])

  const resetResort = useCallback(() => {
    setResort(null)
    setLoading(false)
  }, [])

  return (
    <ResortContext.Provider value={{ resort, loading, error, refreshResort, resetResort }}>
      {children}
    </ResortContext.Provider>
  )
}

export function useResort() {
  const context = useContext(ResortContext)
  if (context === undefined) {
    throw new Error('useResort must be used within a ResortProvider')
  }
  return context
}
