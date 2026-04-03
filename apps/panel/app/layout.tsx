import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ResortProvider } from '@/lib/resort-context'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' })
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'Zuri | The Art of Exceptional Hospitality',
  description: 'Elevate your resort guest experience with AI-powered concierge services and 24/7 intelligent guest support. Personalized, exclusive, and seamless.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background selection:bg-primary/20">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ResortProvider>
            {children}
            <Toaster richColors />
          </ResortProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
