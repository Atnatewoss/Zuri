import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
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
  generator: 'Exp-Ethiopia',
  icons: {
    icon: '/Zuri-logo.png',
  },
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background selection:bg-primary/20" cz-shortcut-listen="true">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ResortProvider>
            {children}
            <Toaster richColors />
          </ResortProvider>
        </ThemeProvider>
      </body>
    </html>

  )
}
