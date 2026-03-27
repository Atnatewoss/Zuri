'use client'

import { useEffect, useRef, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, Clock, Lightbulb } from 'lucide-react'
import { API_BASE_URL, apiFetch } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'

type KnowledgeDocument = {
  id: number
  filename: string
  file_size: string
  status: string
  uploaded_at: string
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeDocument[]>([])
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadDocuments = async (tenantId: string) => {
    const docs = await apiFetch<KnowledgeDocument[]>(
      `/api/knowledge/documents?hotel_id=${encodeURIComponent(tenantId)}`
    )
    setFiles(docs)
  }

  useEffect(() => {
    const tenantId = getTenantHotelId()
    if (!tenantId) {
      setError('No resort session found.')
      setLoading(false)
      return
    }

    setHotelId(tenantId)
    loadDocuments(tenantId)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!hotelId) return
    const hasProcessing = files.some((file) => file.status === 'Processing')
    if (!hasProcessing) return

    const intervalId = window.setInterval(() => {
      loadDocuments(hotelId).catch(() => {
        // Keep polling; transient failures should not break UX.
      })
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [files, hotelId])

  const openFileDialog = () => fileInputRef.current?.click()

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !hotelId) return

    setUploading(true)
    setError(null)
    try {
      await new Promise<void>((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${API_BASE_URL}/api/knowledge/upload?hotel_id=${encodeURIComponent(hotelId)}`)
        const token = window.localStorage.getItem('zuri_session_token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        xhr.upload.onprogress = (progressEvent) => {
          if (!progressEvent.lengthComputable) return
          setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed (${xhr.status})`))
          }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      })

      await loadDocuments(hotelId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const handleDelete = async (documentId: number) => {
    if (!hotelId) return
    try {
      await apiFetch(`/api/knowledge/documents/${documentId}?hotel_id=${encodeURIComponent(hotelId)}`, {
        method: 'DELETE',
      })
      await loadDocuments(hotelId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    }
  }

  const formatUploadTime = (iso: string) => {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
  }

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto flex flex-col relative w-full h-screen">
        <DashboardHeader
          title="Resort Documents"
          subtitle="Provide the guides and policies that shape your AI Concierge"
        />

        <div className="flex-1 p-8 md:p-12 lg:px-20 space-y-8 max-w-[1600px] w-full mx-auto pb-32">
          {/* Top Grid: Upload & Tips side-by-side */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Upload Section (Left 3 columns) */}
            <div
              className="lg:col-span-3 group rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-all cursor-pointer duration-500 overflow-hidden relative flex flex-col items-center justify-center p-12 lg:p-16"
              onClick={openFileDialog}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)_0%,transparent_50%)] opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                  <Upload className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">Upload Knowledge</h3>
              <p className="text-zinc-500 font-medium text-base mb-8 max-w-sm text-center leading-relaxed">Drop your resort&apos;s blueprints, guides, or policies to orchestrate the AI concierge.</p>
              <Button className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-medium">
                {uploading ? 'UPLOADING...' : 'BROWSE DOCUMENTS'}
              </Button>
              {uploading && (
                <p className="mt-4 text-sm font-medium text-primary">Upload progress: {uploadProgress}%</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelected}
                accept=".pdf,.docx,.txt,.md,.csv"
              />
            </div>

            {/* Tips Section (Right 2 columns) */}
            <div className="lg:col-span-2 rounded-3xl bg-zinc-50 border border-zinc-200 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lightbulb className="w-40 h-40 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-8 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-primary" /> Refining Intelligence
              </h3>
              <div className="space-y-6 text-sm text-zinc-500 font-medium leading-relaxed relative z-10">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[10px] text-zinc-400 font-bold">01</span>
                  <p>Include granular details about room categories, prestige amenities, and current pricing structures.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[10px] text-zinc-400 font-bold">02</span>
                  <p>Incorporate comprehensive resort protocols, check-in nuances, and the house code of conduct.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[10px] text-zinc-400 font-bold">03</span>
                  <p>Upload the latest culinary collections from all dining venues to ensure accurate guest recommendations.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[10px] text-zinc-400 font-bold">04</span>
                  <p>Regularly refresh documents to reflect seasonal shifts in services, excursions, and exclusive experiences.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Uploaded Files</h2>
            {loading && <p className="text-sm text-foreground/60 mb-4">Loading documents...</p>}
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Document Name</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">File Size</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Processing Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Uploaded At</th>
                    <th className="px-4 py-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {files.map((file) => (
                      <tr key={file.id} className="group hover:bg-secondary/20 transition-all duration-300">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-serif text-lg text-foreground">{file.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-foreground/40">{file.file_size}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              file.status === 'Ready'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-muted text-foreground/40 border border-border/50'
                            }`}
                          >
                            {file.status === 'Ready' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {file.status}
                          </span>
                        </td>
                      <td className="px-4 py-4 text-sm text-foreground/70">{formatUploadTime(file.uploaded_at)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                          onClick={() => handleDelete(file.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && files.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-foreground/60" colSpan={5}>
                        No documents uploaded yet for this resort.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
