'use client'

import type { LanguageGroup, Repository } from '../lib/types'
import { AlertCircle, ChevronDown, Database } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LanguageSection } from './language-section'
import { Card, CardContent } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

export function DailyTrending({ date }: { date: string }) {
  const [repoGroups, setRepoGroups] = useState<LanguageGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataVisible, setDataVisible] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setDataVisible(false)
        const response = await fetch(`/api/trending/${date}`)

        if (!response.ok)
          throw new Error(`Server error: ${response.status}`)

        const data: Repository[] = await response.json()

        const groupedRepos = data.reduce((acc, repo) => {
          const existingGroup = acc.find(g => g.language === repo.language)
          if (existingGroup) {
            existingGroup.repos.push(repo)
          }
          else {
            acc.push({ language: repo.language, repos: [repo] })
          }
          return acc
        }, [] as LanguageGroup[])

        groupedRepos.sort((a, b) => a.language.localeCompare(b.language))

        setRepoGroups(groupedRepos)
        setLoading(false)
        setTimeout(() => setDataVisible(true), 100)
      }
      catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
        setRepoGroups([])
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <div className="text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (repoGroups.length === 0 && !loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-3">
          <Database className="h-6 w-6 text-muted-foreground/70" />
          <p className="text-sm text-muted-foreground">No repositories found for this date</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 pt-8">
      {loading
        ? (
            <EmptyTable />
          )
        : (
            repoGroups.map(group => (
              <div
                key={group.language}
                className={`transition-all duration-500 ${dataVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                <LanguageSection group={group} />
              </div>
            ))
          )}
    </div>
  )
}

function EmptyTable() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-muted/20 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted/20 rounded" />
            <div className="h-8 w-8 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead className="w-[200px]">Repository</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="w-[100px]">Stars</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-8 bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-[180px] bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="h-4 w-full bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-muted/20 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface ColumnHeaderProps {
  title: string
  type?: string
  isSortable?: boolean
  sortDirection?: 'asc' | 'desc' | false
  onClick?: () => void
}

export function ColumnHeader({ title, type, isSortable, sortDirection, onClick }: ColumnHeaderProps) {
  return (
    <div className="text-left align-middle font-medium">
      <button
        type="button"
        className={`flex items-center justify-between gap-1 w-full px-2 py-1 rounded-md -mx-2 transition-all duration-200
          ${isSortable ? 'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1' : ''}`}
        onClick={onClick}
        disabled={!isSortable}
      >
        <div className="flex items-center">
          <span className={`text-xs font-medium lowercase transition-colors duration-200 ${sortDirection ? 'text-primary' : ''}`}>
            {title}
          </span>
          {type && (
            <span className="ml-2 font-mono text-[10px] text-muted-foreground/50 lowercase transition-colors duration-200">
              {type.toLowerCase()}
            </span>
          )}
        </div>
        {isSortable && (
          <ChevronDown className={`h-3 w-3 text-muted-foreground/70 transition-transform duration-200
            ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
          />
        )}
      </button>
    </div>
  )
}
