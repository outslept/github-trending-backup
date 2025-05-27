import { PanelLeftOpen, Search } from 'lucide-react'

interface SidebarHeaderProps {
  onToggle: () => void
}

export function SidebarHeader({ onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Trending Inspector</span>
      </div>
      <button
        onClick={onToggle}
        className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <PanelLeftOpen className="size-4" />
      </button>
    </div>
  )
}
