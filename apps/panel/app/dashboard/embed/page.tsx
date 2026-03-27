'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiFetch, API_BASE_URL } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'

export default function EmbedWidgetPage() {
  const [copied, setCopied] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [scriptCode, setScriptCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)

  const fallbackSnippet = hotelId
    ? `<script src="${API_BASE_URL}/api/embed/widget.js" data-hotel-id="${hotelId}" data-api-url="${API_BASE_URL}" async></script>`
    : ''

  useEffect(() => {
    const tenantId = getTenantHotelId()
    if (!tenantId) {
      setError('No resort session found. Please sign up or log in again.')
      setLoading(false)
      return
    }
    setHotelId(tenantId)

    apiFetch<{ snippet: string }>(`/api/embed/snippet/${encodeURIComponent(tenantId)}`)
      .then((data) => {
        setScriptCode(data.snippet)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load embed snippet')
        setScriptCode(`<script src="${API_BASE_URL}/api/embed/widget.js" data-hotel-id="${tenantId}" data-api-url="${API_BASE_URL}" async></script>`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleCopy = () => {
    if (!scriptCode) return
    navigator.clipboard.writeText(scriptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyAndVerify = async () => {
    if (!hotelId || !scriptCode) return
    navigator.clipboard.writeText(scriptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    setVerifying(true)
    setVerifyMessage(null)
    try {
      const result = await apiFetch<{ ok: boolean; mockup_url: string }>(
        `/api/embed/verify/${encodeURIComponent(hotelId)}`
      )
      if (result.ok) {
        setVerifyMessage(`Verified. Open mockup test page: ${result.mockup_url}`)
      } else {
        setVerifyMessage('Verification could not confirm setup.')
      }
    } catch (err) {
      setVerifyMessage(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto flex flex-col relative w-full h-screen">
        <DashboardHeader
          title="Embed Widget"
          subtitle="Install Zuri on your website"
        />

        <div className="flex-1 p-8 md:p-12 lg:px-20 space-y-8 max-w-[1600px] w-full mx-auto pb-32">
          <div>
            <p className="text-foreground/70 w-full font-light tracking-tight">
              Add the AI Concierge chat widget to your website. Guests can access Zuri directly from your website to get assistance, make bookings, and ask questions.
            </p>
          </div>

          {/* Code Snippet */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">Installation Code</h2>
            <p className="text-sm text-foreground/70 mb-4">
              Copy this code and paste it into the HTML of your website, right before the closing {'</body>'} tag.
            </p>
            {hotelId && <p className="text-xs text-foreground/60 mb-3">Resort ID: <span className="font-mono">{hotelId}</span></p>}
            {error && <p className="text-sm text-destructive mb-3">{error}</p>}

            <div className="relative">
              <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
                <code>{loading ? 'Loading embed snippet...' : scriptCode || fallbackSnippet}</code>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="absolute top-3 right-3 border-border text-foreground hover:bg-secondary/50"
                disabled={loading || !(scriptCode || fallbackSnippet)}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button
                onClick={handleCopyAndVerify}
                size="sm"
                disabled={loading || verifying || !(scriptCode || fallbackSnippet)}
              >
                {verifying ? 'Verifying...' : 'Copy & Verify Install'}
              </Button>
              {verifyMessage && <p className="text-xs text-foreground/70">{verifyMessage}</p>}
            </div>
          </div>

          {/* Final Polished Side-by-Side: Symmetrical Instructions (Left) and Mini-Preview (Right) */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Instructions (Left) - Baseline Height */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                📋 Installation Instructions
              </h3>
              <ul className="space-y-4 text-zinc-600 font-medium list-none text-xs">
                <li className="flex gap-2.5">
                  <span className="text-primary font-bold">01</span>
                  <span>Copy the code snippet above</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-primary font-bold">02</span>
                  <span>Open your website's HTML editor or contact your web developer</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-primary font-bold">03</span>
                  <span>Paste the code just before the <code className="bg-zinc-200 px-1 rounded text-xs">{"</body>"}</code> closing tag</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-primary font-bold">04</span>
                  <span>Save and refresh your website</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-primary font-bold">05</span>
                  <span>The Zuri chat widget should now appear in the bottom right corner</span>
                </li>
              </ul>
            </div>

            {/* Preview (Right) - Scaled down vertically to match instructions */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-zinc-900">Preview</h2>
                <span className="text-[10px] text-zinc-500 italic">Live Widget Visual</span>
              </div>

              <div className="flex-1 rounded-xl border border-zinc-50 bg-zinc-50/30 flex items-center justify-center relative overflow-hidden group">
                {/* Handheld-style Mini Widget - dramatically smaller vertical footprint */}
                <div className="w-full max-w-[200px] rounded-xl shadow-lg border border-zinc-200 bg-white overflow-hidden scale-90 group-hover:scale-100 transition-transform duration-500">
                  {/* Header */}
                  <div className="bg-zinc-900 text-white p-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                        ✨
                      </div>
                      <span className="font-medium text-[9px] tracking-tight">Ask Zuri</span>
                    </div>
                  </div>

                  {/* Chat Area - Shortened to match instruction height */}
                  <div className="p-2.5 space-y-2 h-24 bg-zinc-50/50 overflow-y-auto no-scrollbar">
                    <div className="flex justify-start">
                      <div className="bg-white text-zinc-700 rounded rounded-tl-none px-2 py-1 text-[8px] shadow-sm border border-zinc-100 max-w-[90%]">
                        Hello! How can I assist you today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-zinc-900 text-white rounded rounded-tr-none px-2 py-1 text-[8px] shadow max-w-[90%]">
                        What activities are available?
                      </div>
                    </div>
                  </div>

                  {/* Input Mockup */}
                  <div className="p-2 border-t border-zinc-50 bg-white">
                    <div className="w-full h-5 rounded-full bg-zinc-50 border border-zinc-100 flex items-center px-2 text-[7px] text-zinc-400 italic">
                      Type your message...
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-zinc-400 mt-3 text-center italic">
                The widget will float in your site&apos;s bottom right corner.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
