import { AppSidebar } from '$/components/app-sidebar'
import { DailyTrending } from '$/components/daily-trending'
import { redirect } from 'next/navigation'

async function getRecentCommits(limit: number = 5) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/outslept/github-trending-backup/commits?per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Trending-Inspector',
        },
        next: { revalidate: 300 },
      },
    )

    if (!response.ok)
      return []

    const commits = await response.json()
    return commits.map((commit: any) => ({
      sha: commit.sha,
      commit: {
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          date: commit.commit.author.date,
        },
      },
      author: {
        login: commit.author?.login || commit.commit.author.name,
        avatar_url: commit.author?.avatar_url || null,
      },
    }))
  }
  catch {
    return []
  }
}

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

  const commits = await getRecentCommits(5)

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
