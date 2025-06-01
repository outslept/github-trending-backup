'use client'

import type { Commit } from '$/lib/types'
import { useMediaQuery } from '$/hooks/use-media-query'
import { useSelectedDate } from '$/hooks/use-selected-date'
import { useSidebarMachine } from '$/hooks/use-sidebar-machine'
import { PanelLeftOpen, Search } from 'lucide-react'
import { CommitList } from './commit-list'
import { DateSelector } from './date-selector'
import { ThemeControls } from './theme-controls'

export function AppSidebar({ initialCommits }: { initialCommits: Commit[] }) {
  const { state, toggle, isVisible, isAnimating } = useSidebarMachine('open')
  const { selectedDate, setSelectedDate } = useSelectedDate()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const isOpen = state === 'open' || state === 'expanding'
  const showToggleButton = state === 'closed' && !isAnimating

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isVisible && (
        <div
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-background border-r z-50 md:z-auto flex flex-col transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      >
        <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Trending Inspector</span>
          </div>
          <button
            onClick={toggle}
            className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        </div>
        <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        <CommitList commits={initialCommits} />
        <ThemeControls />
      </aside>

      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`fixed top-4 left-4 z-40 size-8 border bg-background/95 backdrop-blur-sm rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transition-all duration-300 ease-out ${
          showToggleButton
            ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-x-2 scale-95 pointer-events-none'
        } hover:scale-105 active:scale-95`}
      >
        <PanelLeftOpen className="size-4" />
      </button>
    </>
  )
}
