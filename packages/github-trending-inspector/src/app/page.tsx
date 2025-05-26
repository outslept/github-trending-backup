import { AppSidebar } from '$/components/app-sidebar'
import { DailyTrending } from '$/components/daily-trending'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]

  let date = params.date || today
  if (date === 'today') {
    date = today
  }
  else if (date === 'yesterday') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    date = yesterday.toISOString().split('T')[0]
  }

  if (!params.date || ['today', 'yesterday'].includes(params.date)) {
    redirect(`/?date=${date}`)
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/commits?limit=5`, { next: { revalidate: 60 } })
  const commits = res.ok ? (await res.json()).commits || [] : []

  return (
    <div className="flex min-h-screen">
      <AppSidebar initialCommits={commits} />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <DailyTrending date={date} />
          </div>
        </main>
      </div>
    </div>
  )
}
