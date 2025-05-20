'use client'

import { Calendar } from '$/components/ui/calendar'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader } from '$/components/ui/sidebar'
import { Clock, Monitor, Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

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
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch('https://api.github.com/repos/outslept/github-trending-backup/commits?per_page=5')
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

  const getRelativeTime = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`
  }

  return (
    <div className="hidden lg:block fixed top-0 left-0 h-full">
      <Sidebar className="h-full">
        <SidebarHeader className="p-4 border-b">
          <Calendar
            mode="single"
            selected={new Date(selectedDate)}
            onSelect={date => date && onDateChange(date.toISOString().split('T')[0])}
            initialFocus
          />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between mb-2">
              <SidebarGroupLabel>Recent Commits</SidebarGroupLabel>
            </div>

            <div className="space-y-2">
              {loading
                ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-2">
                        <div className="h-4 w-4 rounded-full bg-muted" />
                        <div className="flex-1">
                          <div className="h-3 w-16 bg-muted rounded mb-2" />
                          <div className="h-4 w-full bg-muted rounded" />
                        </div>
                        <div className="h-6 w-6 rounded-full bg-muted" />
                      </div>
                    ))
                  )
                : (
                    commits.map(commit => (
                      <div
                        key={commit.sha}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => window.open(`https://github.com/outslept/github-trending-backup/commit/${commit.sha}`, '_blank')}
                      >
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={commit.author?.avatar_url} alt={commit.commit.author.name} />
                          <AvatarFallback className="text-[10px]">
                            {commit.commit.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <code className="text-xs font-mono text-muted-foreground">{commit.sha.slice(0, 7)}</code>
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(commit.commit.author.date)}
                            </span>
                          </div>
                          <p className="text-sm truncate">{commit.commit.message}</p>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {mounted && (
                <span>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>
            <div className="inline-flex items-center rounded-full border">
              <button
                onClick={() => setTheme('light')}
                className={`h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer transition-colors
                  ${mounted && theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer transition-colors
                  ${mounted && theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer transition-colors
                  ${mounted && theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
