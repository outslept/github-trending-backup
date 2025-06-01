'use client'

import { Clock, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  )

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      )
    }

    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeoutId = setTimeout(() => {
      updateTime()
      const intervalId = setInterval(updateTime, 60000)

      return () => clearInterval(intervalId)
    }, msUntilNextMinute)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      <span className="font-mono">{currentTime}</span>
    </div>
  )
}

const themeButtons = [
  { theme: 'light', icon: Sun },
  { theme: 'dark', icon: Moon },
  { theme: 'system', icon: Monitor },
]

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center border">
      {themeButtons.map(({ theme: themeOption, icon: Icon }) => (
        <button
          key={themeOption}
          onClick={() => setTheme(themeOption)}
          className={`size-6 flex items-center justify-center transition-colors ${
            theme === themeOption
              ? 'bg-muted text-foreground'
              : 'hover:bg-muted/50'
          }`}
        >
          <Icon className="size-3" />
        </button>
      ))}
    </div>
  )
}

export function ThemeControls() {
  return (
    <div className="p-3 border-t flex-shrink-0">
      <div className="flex items-center justify-between">
        <ClockDisplay />
        <ThemeSwitcher />
      </div>
    </div>
  )
}
