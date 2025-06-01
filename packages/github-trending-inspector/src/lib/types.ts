import type { SortingState, VisibilityState } from '@tanstack/react-table'

export interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string | null
  }
}

export type SidebarState = 'open' | 'closed' | 'expanding' | 'collapsing'

export interface Repository {
  rank: number
  repo: string
  desc: string
  stars: number
  forks: number
  today: number
}

export interface LanguageGroup {
  language: string
  repos: Repository[]
}

export interface TableState {
  sorting: SortingState
  columnVisibility: VisibilityState
  globalFilter: string
  pagination: {
    pageIndex: number
    pageSize: number
  }
}

export interface TrendingData {
  state: 'loading'
    | 'date-unavailable'
    | 'error'
    | 'empty'
    | 'success'
  groups: LanguageGroup[]
  error?: string
}
