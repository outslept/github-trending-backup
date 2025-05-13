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

  const account = await db.query.account.findFirst({
    where: (account, { eq, and }) => and(
      eq(account.userId, session.user.id),
      eq(account.providerId, 'github')
    )
  })

  if (!account?.accessToken) {
    return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 })
  }

  const response = await fetch('https://api.github.com/user/starred', {
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  const data = await response.json()
  return NextResponse.json(data)
}
