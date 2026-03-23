'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function EmbedWidgetPage() {
  const [copied, setCopied] = useState(false)

  const scriptCode = `<script src="https://zuri.ai/widget.js" data-hotel-id="kuriftu-demo"></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Embed Widget"
          subtitle="Install Zuri on your website"
        />

        <div className="p-8 space-y-8">
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

            <div className="relative">
              <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
                <code>{scriptCode}</code>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="absolute top-3 right-3 border-border text-foreground hover:bg-secondary/50"
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
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">Preview</h2>
            <p className="text-sm text-foreground/70 mb-6">
              This is how the widget will appear on your website:
            </p>

            <div className="rounded-lg border border-border/50 bg-secondary/10 p-12 flex items-center justify-end relative h-96">
              <div className="absolute bottom-6 right-6 space-y-3">
                {/* Chat Widget Preview */}
                <div className="w-80 rounded-xl shadow-2xl overflow-hidden bg-white border border-gray-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary to-accent text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                        ✨
                      </div>
                      <span className="font-medium">Ask Zuri</span>
                    </div>
                    <button className="text-white/70 hover:text-white">_</button>
                  </div>

                  {/* Chat Area */}
                  <div className="p-4 space-y-4 h-64 bg-gray-50">
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 text-sm max-w-xs">
                        Hello! How can I assist you today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-white rounded-lg px-4 py-2 text-sm max-w-xs">
                        What activities are available?
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-foreground/60 mt-4">
              The floating chat button will appear in the bottom right corner of your website
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <h3 className="font-medium text-foreground">📋 Installation Instructions</h3>
            <ol className="space-y-3 text-sm text-foreground/80 list-decimal list-inside">
              <li>Copy the code snippet above</li>
              <li>Open your website's HTML editor or contact your web developer</li>
              <li>Paste the code just before the {'</body>'} closing tag</li>
              <li>Save and refresh your website</li>
              <li>The Zuri chat widget should now appear in the bottom right corner</li>
            </ol>
          </div>

          {/* Support */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-6 space-y-4">
            <h3 className="font-medium text-foreground">❓ Need Help?</h3>
            <p className="text-sm text-foreground/70">
              Having trouble installing the widget? Check our documentation or contact our support team.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary/50">
                View Documentation
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary/50">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
