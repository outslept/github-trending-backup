import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (request.nextUrl.pathname.startsWith('/api/github') && !sessionCookie) {
    if (request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}
