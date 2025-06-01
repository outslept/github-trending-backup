import { AppSidebar } from '$/components/app-sidebar'
import { DailyTrending } from '$/components/daily-trending'
import { getRecentCommits } from '$/lib/github'
import { notFound } from 'next/navigation'

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    notFound()
  }

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    notFound()
  }

  const commits = await getRecentCommits(5)

  return (
    <div className="flex min-h-screen">
      <AppSidebar initialCommits={commits} selectedDate={new Date(date)} />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="container mx-auto px-4 py-6">
          <DailyTrending date={date} />
        </div>
      </div>
    </div>
  )
}
