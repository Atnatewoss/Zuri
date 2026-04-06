'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, FileText, Share2, Clipboard } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface FileContentModalProps {
  id: number | null
  filename: string | null
  hotelId: string | null
  onClose: () => void
}

export function FileContentModal({ id, filename, hotelId, onClose }: FileContentModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id && hotelId) {
      loadContent()
    } else {
      setContent(null)
    }
  }, [id, hotelId])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch<{ content: string }>(
        `/api/knowledge/documents/${id}/content?hotel_id=${encodeURIComponent(hotelId!)}`
      )
      setContent(data.content)
    } catch (err) {
      toast.error('Failed to load content', {
        description: err instanceof Error ? err.message : 'Could not retrieve document reconstruction.'
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      toast.success('Copied to clipboard')
    }
  }

  const renderMarkdown = (text: string) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      // Headings
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-6 mb-4 text-foreground">{line.replace('# ', '')}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-5 mb-3 text-foreground/90">{line.replace('## ', '')}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground/80">{line.replace('### ', '')}</h3>
      }
      
      // Horizontal Rule
      if (line === '---') {
        return <hr key={i} className="my-6 border-border" />
      }

      // List Items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mb-1 list-disc text-[15px]">
            {parseInlines(line.substring(2))}
          </li>
        )
      }

      // Normal Paragraph with inline parsing
      return (
        <p key={i} className="mb-4 text-[15px] leading-relaxed text-foreground/80">
          {parseInlines(line)}
        </p>
      )
    })
  }

  const parseInlines = (text: string) => {
    // Basic bold/italic parsing
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-border bg-background shadow-2xl rounded-[2rem]">
        <DialogHeader className="p-8 pb-5 border-b border-border bg-muted/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{filename}</DialogTitle>
                <DialogDescription className="text-muted-foreground font-semibold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                   AI Intelligence Source
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-all text-xs font-bold border border-border"
               >
                  <Clipboard className="w-3.5 h-3.5" />
                  Copy Text
               </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-10 font-sans scrollbar-thin scrollbar-thumb-muted">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Reconstructing intelligence sequence...</p>
            </div>
          ) : content ? (
            <div className="markdown-viewer max-w-full">
               {renderMarkdown(content)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20 italic">No content extracted yet.</p>
          )}
        </div>

        <div className="px-8 py-5 border-t border-border bg-muted/20 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.15em]">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.6)]" />
              Live Knowledge Store
           </div>
           <p className="text-[11px] text-muted-foreground font-medium italic opacity-70">
              Verified ground-truth data for Zuri Guest Responses.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
