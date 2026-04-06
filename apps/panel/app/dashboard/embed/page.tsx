'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiFetch, PUBLIC_API_BASE_URL } from '@/lib/api'
import { getTenantHotelId } from '@/lib/tenant'
import { toast } from 'sonner'

export default function EmbedWidgetPage() {
  const [copied, setCopied] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [scriptCode, setScriptCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)
  const [allowedDomains, setAllowedDomains] = useState('')
  const [savingDomains, setSavingDomains] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fallbackSnippet = hotelId
    ? `<script src="${PUBLIC_API_BASE_URL}/api/embed/widget.js" data-hotel-id="${hotelId}" data-api-url="${PUBLIC_API_BASE_URL}" async></script>`
    : ''

  useEffect(() => {
    const tenantId = getTenantHotelId()
    if (!tenantId) {
      toast.error('Session missing', {
        description: 'No resort session was found. Please sign in again.',
      })
      setLoading(false)
      return
    }
    setHotelId(tenantId)

    // Only fetch snippet and allowed domains (resort info is global now)
    Promise.all([
      apiFetch<{ snippet: string }>(`/api/embed/snippet/${encodeURIComponent(tenantId)}`),
      apiFetch<{ allowed_domains: string }>(`/api/settings?hotel_id=${encodeURIComponent(tenantId)}`)
    ])
      .then(([snippetData, settingsData]) => {
        setScriptCode(snippetData.snippet)
        setAllowedDomains(settingsData.allowed_domains || '')
      })
      .catch((err) => {
        toast.error('Unable to load widget data', {
          description:
            err instanceof Error
              ? err.message
              : 'We could not load widget data right now. Please try again.',
        })
        setScriptCode(`<script src="${PUBLIC_API_BASE_URL}/api/embed/widget.js" data-hotel-id="${tenantId}" data-api-url="${PUBLIC_API_BASE_URL}" async></script>`)
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
      const description =
        err instanceof Error
          ? err.message
          : 'We could not verify your embed setup right now. Please try again.'
      setVerifyMessage(description)
      toast.error('Verification failed', { description })
    } finally {
      setVerifying(false)
    }
  }

  const handleDomainsSave = async () => {
    if (!hotelId) return
    setSavingDomains(true)
    try {
      await apiFetch(`/api/settings?hotel_id=${encodeURIComponent(hotelId)}`, {
        method: 'PUT',
        bodyJson: {
          allowed_domains: allowedDomains
        },
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      toast.error('Unable to save access settings', {
        description:
          err instanceof Error
            ? err.message
            : 'We could not save access settings right now. Please try again.',
      })
    } finally {
      setSavingDomains(false)
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

          {/* Quick Setup Re-trigger */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Testing locally or evaluating for hackathon?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                   You can automatically configure access rules and launch the demo environment.
                </p>
             </div>
             <Button 
               variant="outline" 
               size="sm"
               className="border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
               onClick={() => {
                  sessionStorage.removeItem('zuri_judge_onboarded');
                  window.location.reload();
               }}
             >
                Run automated setup
             </Button>
          </div>

          {/* Widget Access Control */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Widget Access Control</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage AI widget deployment security</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground/80">Authorized Domains</Label>
                <div className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Domains authorized to load your Zuri concierge. Add new domains below or remove existing ones.
                </div>

                {/* Domain chips */}
                {(() => {
                  const domainList = allowedDomains
                    .split(',')
                    .map(d => d.trim())
                    .filter(Boolean)

                  const removeDomain = (domainToRemove: string) => {
                    const updated = domainList
                      .filter(d => d !== domainToRemove)
                      .join(', ')
                    setAllowedDomains(updated)
                  }

                  return (
                    <div className="space-y-3">
                      {domainList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {domainList.map((domain) => (
                            <span
                              key={domain}
                              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 group transition-colors"
                            >
                              <span className="font-mono text-xs">{domain}</span>
                              <button
                                type="button"
                                onClick={() => removeDomain(domain)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-primary/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                aria-label={`Remove ${domain}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic py-2">No domains configured yet. Your widget will not load on any external site.</p>
                      )}
                    </div>
                  )
                })()}

                {/* Add new domain input */}
                <div className="flex gap-2 pt-1">
                  <Input
                    id="newDomainInput"
                    placeholder="https://your-resort.com"
                    className="bg-background border-border text-foreground h-11 rounded-xl focus:ring-primary/20 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.currentTarget
                        const val = input.value.trim()
                        if (!val) return
                        const existing = allowedDomains.split(',').map(d => d.trim()).filter(Boolean)
                        if (!existing.includes(val)) {
                          setAllowedDomains([...existing, val].join(', '))
                        }
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 border-border"
                    onClick={() => {
                      const input = document.getElementById('newDomainInput') as HTMLInputElement
                      const val = input?.value?.trim()
                      if (!val) return
                      const existing = allowedDomains.split(',').map(d => d.trim()).filter(Boolean)
                      if (!existing.includes(val)) {
                        setAllowedDomains([...existing, val].join(', '))
                      }
                      if (input) input.value = ''
                    }}
                  >
                    + Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <Button
                  onClick={handleDomainsSave}
                  disabled={loading || savingDomains}
                  className="rounded-full px-10 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium transition-all shadow-sm"
                >
                  {savingDomains ? 'Persisting...' : 'SAVE ACCESS SETTINGS'}
                </Button>
                {saveSuccess && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in slide-in-from-left-2 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Security rules updated.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Final Polished Side-by-Side: Symmetrical Instructions (Left) and Mini-Preview (Right) */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Instructions (Left) - Baseline Height */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                📋 Installation Instructions
              </h3>
              <ul className="space-y-4 text-muted-foreground font-medium list-none text-xs">
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
                  <span>Paste the code just before the <code className="bg-muted px-1 rounded text-xs text-foreground">{"</body>"}</code> closing tag</span>
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
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-card-foreground">Preview</h2>
                <span className="text-[10px] text-muted-foreground italic">Live Widget Visual</span>
              </div>

              <div className="flex-1 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-center relative overflow-hidden group">
                {/* Handheld-style Mini Widget - dramatically smaller vertical footprint */}
                <div className="w-full max-w-[200px] rounded-xl shadow-lg border border-border bg-background overflow-hidden scale-90 group-hover:scale-100 transition-transform duration-500">
                  {/* Header */}
                  <div className="bg-foreground text-background p-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-background/10 flex items-center justify-center text-[10px]">
                        ✨
                      </div>
                      <span className="font-medium text-[9px] tracking-tight">Ask Zuri</span>
                    </div>
                  </div>

                  {/* Chat Area - Shortened to match instruction height */}
                  <div className="p-2.5 space-y-2 h-24 bg-muted/30 overflow-y-auto no-scrollbar">
                    <div className="flex justify-start">
                      <div className="bg-card text-card-foreground rounded rounded-tl-none px-2 py-1 text-[8px] shadow-sm border border-border max-w-[90%]">
                        Hello! How can I assist you today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded rounded-tr-none px-2 py-1 text-[8px] shadow max-w-[90%]">
                        What activities are available?
                      </div>
                    </div>
                  </div>

                  {/* Input Mockup */}
                  <div className="p-2 border-t border-border bg-background">
                    <div className="w-full h-5 rounded-full bg-muted border border-border flex items-center px-2 text-[7px] text-muted-foreground italic">
                      Type your message...
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-muted-foreground mt-3 text-center italic">
                The widget will float in your site&apos;s bottom right corner.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
