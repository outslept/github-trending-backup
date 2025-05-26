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
    avatar_url: string
  }
}

export type SidebarState = 'open' | 'closed' | 'expanding' | 'collapsing'

export interface Repository {
  name: string
  rank: number
  title: string
  url: string
  description: string
  stars: string
  forks: string
  language: string
  starsToday: string
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

type TrendingState =
  | 'loading'
  | 'date-unavailable'
  | 'error'
  | 'empty'
  | 'success'

export interface TrendingData {
  state: TrendingState
  groups: LanguageGroup[]
  error?: string
}
