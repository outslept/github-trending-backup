import { useEffect, useState } from 'react'
import { useSession } from '$/lib/auth-client'
import { Card, CardContent, CardHeader, CardTitle } from '$/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$/components/ui/table'
import { Button } from '$/components/ui/button'
import { toast } from 'sonner'

interface Repository {
  rank: number
  title: string
  url: string
  description: string
  stars: string
  forks: string
  todayStars: string
  language: string
  isStarred?: boolean
}

export function DailyTrending({ date }: Readonly<{ date: string }>) {
  const { data: session, isPending } = useSession()
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching data for date:', date)
        const response = await fetch(`/api/trending/${date}`)
        console.log('Response status:', response.status)

        const contentType = response.headers.get('content-type')
        console.log('Content-Type:', contentType)

        if (!contentType?.includes('application/json')) {
          const text = await response.text()
          console.error('Received non-JSON response:', text)
          throw new Error('Server returned non-JSON response')
        }

        const data = await response.json()
        console.log('Parsed data:', data)

        if ('error' in data) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data)) {
          console.error('Invalid data structure:', data)
          throw new Error('Invalid data format received from server')
        }

        setRepos(data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
        setRepos([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  const toggleStar = async (repo: Repository) => {
    if (!session?.user) {
      toast.error('Please sign in to star repositories')
      return
    }

    try {
      const response = await fetch('/api/github/star', {
        method: repo.isStarred ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ repoName: repo.title })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle star')
      }

      setRepos(currentRepos =>
        currentRepos.map(r =>
          r.title === repo.title
            ? { ...r, isStarred: !r.isStarred }
            : r
        )
      )

      toast.success(
        repo.isStarred
          ? 'Repository unstarred successfully'
          : 'Repository starred successfully'
      )
    } catch (error) {
      console.error('Failed to toggle star:', error)
      toast.error('Failed to toggle star')
    }
  }

  if (loading || isPending) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          Loading...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px] text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (repos.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          No repositories found for this date
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Repositories - {date}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Stars</TableHead>
              <TableHead>Today</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repos.map((repo) => (
              <TableRow key={repo.url}>
                <TableCell>{repo.rank}</TableCell>
                <TableCell>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {repo.title}
                  </a>
                </TableCell>
                <TableCell className="max-w-md truncate">{repo.description}</TableCell>
                <TableCell>{repo.language}</TableCell>
                <TableCell>{repo.stars}</TableCell>
                <TableCell>{repo.todayStars}</TableCell>
                <TableCell>
                  {session?.user && (
                    <Button
                      variant={repo.isStarred ? "secondary" : "default"}
                      onClick={() => toggleStar(repo)}
                      className="w-24"
                    >
                      {repo.isStarred ? "Unstar" : "Star"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
