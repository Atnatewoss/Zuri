'use client'

import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const pathname = usePathname()
  const isLightOnlyToastRoute = pathname === '/onboarding' || pathname === '/signup' || pathname === '/login'
  const toasterTheme = isLightOnlyToastRoute ? 'light' : (theme as ToasterProps['theme'])

  return (
    <Sonner
      theme={toasterTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
