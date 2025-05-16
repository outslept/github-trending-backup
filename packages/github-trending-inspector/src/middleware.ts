import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from './lib/auth'

const authRoutes = ['/sign-in', '/sign-up']

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const { pathname } = request.nextUrl

  // If user is authenticated but trying to access auth routes
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
