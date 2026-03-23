'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle2, Clock, Trash2, Lightbulb } from 'lucide-react'

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
          <div className="group rounded-2xl border-2 border-dashed border-border/50 bg-card/40 backdrop-blur-sm p-16 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer duration-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)_0%,transparent_50%)] opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                <Upload className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-3xl font-serif text-foreground mb-3">Impart <span className="italic text-primary">Intelligence</span></h3>
            <p className="text-foreground/50 font-light text-lg mb-8 max-w-sm mx-auto tracking-tight">Drop your resort&apos;s blueprints, guides, or policies to orchestrate the AI concierge.</p>
            <Button className="rounded-full px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20">
              BROWSE DOCUMENTS
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
                      <tr key={file.id} className="group hover:bg-secondary/20 transition-all duration-300">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-serif text-lg text-foreground">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-foreground/40">{file.size}</td>
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
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lightbulb className="w-32 h-32 text-primary" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-6 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-primary" /> Refining Intelligence
            </h3>
            <ul className="grid sm:grid-cols-2 gap-4 text-sm text-foreground/60 font-light leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary italic font-serif text-lg leading-none">01</span>
                Include granular details about room categories, prestige amenities, and current pricing structures.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary italic font-serif text-lg leading-none">02</span>
                Incorporate comprehensive resort protocols, check-in nuances, and the house code of conduct.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary italic font-serif text-lg leading-none">03</span>
                Upload the latest culinary collections from all dining venues to ensure accurate guest recommendations.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary italic font-serif text-lg leading-none">04</span>
                Regularly refresh documents to reflectseasonal shifts in services, excursions, and exclusive experiences.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
