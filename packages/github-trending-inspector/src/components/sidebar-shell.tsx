import type { SidebarState } from '$/lib/types'
import { PanelLeftOpen } from 'lucide-react'

interface SidebarShellProps {
  state: SidebarState
  onToggle: () => void
  isVisible: boolean
  isAnimating: boolean
  children: React.ReactNode
}

export function SidebarShell({ state, onToggle, isVisible, isAnimating, children }: SidebarShellProps) {
  const isOpen = state === 'open' || state === 'expanding'
  const showToggleButton = state === 'closed' && !isAnimating

  return (
    <>
      {/* Mobile Overlay */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-background border-r z-50 md:z-auto flex flex-col transform transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {children}
      </aside>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-40 size-8 border bg-background/95 backdrop-blur-sm rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground transform transition-all duration-100 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${showToggleButton ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-2 pointer-events-none'}`}
      >
        <PanelLeftOpen className="size-4" />
      </button>
    </>
  )
}
