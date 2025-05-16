import { headers } from 'next/headers'
import { auth } from './auth'

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

export async function getUser() {
  const session = await getSession()
  return session?.user
}
