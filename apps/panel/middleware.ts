import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hotelId = request.cookies.get('zuri_hotel_id')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtectedRoute && !hotelId) {
    // Explicitly allow the login page to load
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && hotelId) {
    // If already logged in, redirect to dashboard (unless we're explicitly trying to log out)
    // Note: handleLogout should clear cookies before redirecting to avoid loops
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/onboarding/:path*', 
    '/login', 
    '/signup'
  ],
}
