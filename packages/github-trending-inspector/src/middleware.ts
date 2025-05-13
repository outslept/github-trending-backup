import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (request.nextUrl.pathname.startsWith('/api/github') && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/github/:path*']
}
