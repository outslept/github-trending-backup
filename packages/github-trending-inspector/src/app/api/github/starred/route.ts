import { db } from '$/db'
import { auth } from '$/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const account = await db.query.accounts.findFirst({
    where: (accounts, { eq, and }) => and(
      eq(accounts.userId, session.user.id),
      eq(accounts.provider, 'github')
    )
  })

  if (!account?.access_token) {
    return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 })
  }

  const response = await fetch('https://api.github.com/user/starred', {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  const data = await response.json()
  return NextResponse.json(data)
}
