'use client'

import type { LucideIcon } from 'lucide-react'
import { Clock, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ThemeButtonProps {
  theme: 'light' | 'dark' | 'system'
  currentTheme: string | undefined
  isMounted: boolean
  onClick: () => void
  icon: LucideIcon
}

function ThemeButton({ theme, currentTheme, isMounted, onClick, icon: Icon }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`h-6 w-6 flex items-center justify-center transition-colors ${
        isMounted && currentTheme === theme ? 'bg-muted text-foreground' : 'hover:bg-muted/50'
      }`}
    >
      <Icon className="h-3 w-3" />
    </button>
  )
}

export function ThemeControls() {
  const { theme, setTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState('--:--')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-3 border-t flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="font-mono">{currentTime}</span>
        </div>

        <div className="flex items-center border">
          <ThemeButton
            theme="light"
            currentTheme={theme}
            isMounted={isMounted}
            onClick={() => setTheme('light')}
            icon={Sun}
          />
          <ThemeButton
            theme="dark"
            currentTheme={theme}
            isMounted={isMounted}
            onClick={() => setTheme('dark')}
            icon={Moon}
          />
          <ThemeButton
            theme="system"
            currentTheme={theme}
            isMounted={isMounted}
            onClick={() => setTheme('system')}
            icon={Monitor}
          />
        </div>
      </div>
    </div>
  )
}
