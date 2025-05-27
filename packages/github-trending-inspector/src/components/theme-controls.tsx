'use client'

import { Clock, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const themeOptions = [
  { theme: 'light', icon: Sun },
  { theme: 'dark', icon: Moon },
  { theme: 'system', icon: Monitor },
]

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
          <Clock className="size-3" />
          <span className="font-mono">{currentTime}</span>
        </div>

        <div className="flex items-center border">
          {themeOptions.map(({ theme: themeOption, icon: Icon }) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`size-6 flex items-center justify-center transition-colors ${
                isMounted && theme === themeOption
                  ? 'bg-muted text-foreground'
                  : 'hover:bg-muted/50'
              }`}
            >
              <Icon className="size-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
