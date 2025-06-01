import { redirect } from 'next/navigation'

export default function HomePage() {
  const today = new Date().toISOString().split('T')[0]
  redirect(`/${today}`)
}
