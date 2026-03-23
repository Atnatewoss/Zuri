import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="text-6xl">🏨</div>
        <h1 className="text-5xl font-light text-foreground">
          404
        </h1>
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-foreground">
            Page Not Found
          </h2>
          <p className="text-foreground/70">
            It seems like you've wandered off the beaten path. Let us guide you back to the lobby.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary/50">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
