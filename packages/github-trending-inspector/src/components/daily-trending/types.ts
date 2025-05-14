export interface Repository {
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

export interface LanguageGroup {
  language: string
  repos: Repository[]
}

export type SortDirection = 'asc' | 'desc' | false

export interface ExportOptions {
  type: 'json' | 'csv'
  filename: string
  data: Repository[]
}
