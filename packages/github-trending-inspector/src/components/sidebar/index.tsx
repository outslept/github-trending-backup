'use client'

import { Button } from '$/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader } from '$/components/ui/sidebar'
import { Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DatePicker } from './date-picker'
import { ThemeToggle } from './theme-toggle'

interface SidebarProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

interface Commit {
  sha: string
  commit: {
    message: string
    author: { name: string, date: string }
  }
  author: { login: string, avatar_url: string }
}

export function AppSidebar({ selectedDate, onDateChange }: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetch(`https://api.github.com/repos/outslept/github-trending-backup/commits?per_page=5`)
      .then(response => response.json())
      .then((data) => {
        setCommits(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching commits:', error)
        setLoading(false)
      })
  }, [])

  if (!isMounted)
    return null

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays === 0 ? 'Today' : diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`
  }

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
    if (isCollapsed) {
      setIsHovered(false)
    }
  }

  const sidebarPosition = isCollapsed ? '-translate-x-full' : (isHovered ? 'translate-x-0' : '-translate-x-[calc(100%-16px)]')

  return (
    <div className="relative">
      <div
        className="fixed top-0 left-0 h-16 w-16 z-40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <Button
        variant={isCollapsed ? 'secondary' : 'ghost'}
        size="icon"
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50"
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      <div
        className={`fixed top-0 left-0 h-full z-40 w-80 transition-transform duration-300 ${sidebarPosition}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <DatePicker value={selectedDate} onChange={onDateChange} />
          </SidebarHeader>

          <SidebarContent className="flex flex-col flex-1">
            <SidebarGroup>
              <div className="flex items-center justify-between mb-2">
                <SidebarGroupLabel className="text-sm font-medium">Recent Commits</SidebarGroupLabel>
              </div>

              {loading
                ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-3 p-2 animate-pulse">
                          <div className="h-4 w-4 rounded-full bg-muted" />
                          <div className="flex-1">
                            <div className="h-3 w-16 bg-muted rounded mb-2" />
                            <div className="h-4 w-full bg-muted rounded" />
                          </div>
                          <div className="h-6 w-6 rounded-full bg-muted" />
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <div className="space-y-2">
                      {commits.map(commit => (
                        <div
                          key={commit.sha}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => window.open(`https://github.com/outslept/github-trending-backup/commit/${commit.sha}`, '_blank')}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={commit.author?.avatar_url} alt={commit.commit.author.name} />
                            <AvatarFallback className="text-[10px]">
                              {commit.commit.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <code className="text-xs font-mono text-muted-foreground">{commit.sha.substring(0, 7)}</code>
                              <span className="text-xs text-muted-foreground">{getRelativeTime(commit.commit.author.date)}</span>
                            </div>
                            <p className="text-sm truncate">{commit.commit.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </div>
  )
}
