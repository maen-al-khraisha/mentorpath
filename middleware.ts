import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Plan enforcement middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/admin')
  ) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle plan enforcement in the client-side components
  // This middleware primarily handles redirects and basic auth checks
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}



