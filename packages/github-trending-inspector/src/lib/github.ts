interface CommitAuthor {
  name: string
  date: string
}

interface CommitData {
  sha: string
  commit: {
    message: string
    author: CommitAuthor
  }
  author: {
    login: string
    avatar_url: string | null
  }
}

const GITHUB_API_URL = 'https://api.github.com/repos/outslept/github-trending-backup/commits'
const FETCH_CONFIG = {
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Trending-Inspector',
  },
  next: { revalidate: 300 },
}

export async function getRecentCommits(limit: number = 5): Promise<CommitData[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}?per_page=${limit}`,
      FETCH_CONFIG,
    )

    if (!response.ok) {
      console.error('GitHub API responded with status:', response.status)
      return []
    }

    const commits: CommitData[] = await response.json()
    return commits.map(({ sha, commit, author }) => ({
      sha,
      commit: {
        message: commit.message,
        author: {
          name: commit.author.name,
          date: commit.author.date,
        },
      },
      author: {
        login: author?.login ?? commit.author.name,
        avatar_url: author?.avatar_url,
      },
    }))
  }
  catch (error) {
    console.error('Failed to fetch commits:', error)
    return []
  }
}
