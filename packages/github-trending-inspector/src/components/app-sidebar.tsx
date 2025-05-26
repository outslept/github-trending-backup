'use client'

import type { Commit } from '$/lib/types'
import { useSelectedDate } from '$/hooks/use-selected-date'
import { useSidebarMachine } from '$/hooks/use-sidebar-machine'
import { CommitList } from './commit-list'
import { DateSelector } from './date-selector'
import { SidebarHeader } from './sidebar-header'
import { SidebarShell } from './sidebar-shell'
import { ThemeControls } from './theme-controls'

interface AppSidebarProps {
  initialCommits: Commit[]
}

export function AppSidebar({ initialCommits }: AppSidebarProps) {
  const { state, toggle, isVisible, isAnimating } = useSidebarMachine('open')
  const { selectedDate, setSelectedDate } = useSelectedDate()

  return (
    <SidebarShell
      state={state}
      onToggle={toggle}
      isVisible={isVisible}
      isAnimating={isAnimating}
    >
      <SidebarHeader onToggle={toggle} />
      <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <CommitList commits={initialCommits} />
      <ThemeControls />
    </SidebarShell>
  )
}
