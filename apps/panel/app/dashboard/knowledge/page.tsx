'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

const uploadedFiles = [
  { id: 1, name: 'Resort_Handbook_2024.pdf', size: '2.4 MB', status: 'Ready', uploadedAt: '2 days ago' },
  { id: 2, name: 'Dining_Menu_Collection.pdf', size: '1.8 MB', status: 'Ready', uploadedAt: '1 day ago' },
  { id: 3, name: 'Room_Policies.docx', size: '456 KB', status: 'Ready', uploadedAt: '12 hours ago' },
  { id: 4, name: 'Spa_Services_List.pdf', size: '890 KB', status: 'Processing', uploadedAt: '2 hours ago' },
  { id: 5, name: 'Activity_Guide.pdf', size: '1.2 MB', status: 'Ready', uploadedAt: '1 hour ago' },
]

export default function KnowledgeBasePage() {
  return (
    <div className="flex bg-background min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <DashboardHeader
          title="Knowledge Base"
          subtitle="Manage documents that train your AI concierge"
        />

        <div className="p-8 space-y-8">
          {/* Upload Section */}
          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 p-12 text-center hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Drag & drop files here</h3>
            <p className="text-foreground/70 mb-4">or click to browse from your computer</p>
            <p className="text-sm text-foreground/60 mb-6">Supports: PDF, DOC, DOCX, TXT, XLSX</p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Choose Files
            </Button>
          </div>

          {/* Uploaded Files */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Uploaded Files</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">File Name</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Size</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground/70">Uploaded</th>
                    <th className="px-4 py-4 text-right text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {uploadedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📄</span>
                          <span className="font-medium text-foreground">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/70">{file.size}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            file.status === 'Ready'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground/70'
                          }`}
                        >
                          {file.status === 'Ready' ? '✓' : '⏳'} {file.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/70">{file.uploadedAt}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-medium text-foreground mb-3">💡 Tips for Better AI Responses</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• Include detailed information about room types, amenities, and pricing</li>
              <li>• Upload your resort policies, check-in procedures, and house rules</li>
              <li>• Add menus from your restaurants and dining information</li>
              <li>• Include activity descriptions and booking procedures</li>
              <li>• Update documents regularly as services and prices change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
