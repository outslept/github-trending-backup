'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button className="inline-flex items-center rounded-full border p-0" aria-label="Toggle Theme">
      <Sun
        className={`size-6.5 rounded-full p-1.5 text-muted-foreground cursor-pointer transition-colors ${
          theme === 'light' && 'bg-accent text-accent-foreground'
        }`}
        onClick={() => setTheme('light')}
      />
      <Moon
        className={`size-6.5 rounded-full p-1.5 text-muted-foreground cursor-pointer transition-colors ${
          theme === 'dark' && 'bg-accent text-accent-foreground'
        }`}
        onClick={() => setTheme('dark')}
      />
      <Monitor
        className={`size-6.5 rounded-full p-1.5 text-muted-foreground cursor-pointer transition-colors ${
          theme === 'system' && 'bg-accent text-accent-foreground'
        }`}
        onClick={() => setTheme('system')}
      />
    </button>
  )
}
