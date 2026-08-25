import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

import { SidebarDatePicker } from './sidebar-date-picker'
import { TableOfContents } from './table-of-contents'
import type { LanguageGroup } from '../lib/types'

interface AppSidebarProps {
  date: string
  filteredGroups: LanguageGroup[]
  globalFilterInput: string
  setGlobalFilterInput: (v: string) => void
  navigateToDate: (iso: string) => void
  activeId: string | null
}

export function AppSidebar({
  date,
  filteredGroups,
  globalFilterInput,
  setGlobalFilterInput,
  navigateToDate,
  activeId,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>

          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:hidden">
            <div className="space-y-2">
              <SidebarDatePicker date={date} onDateChange={navigateToDate} />
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={globalFilterInput}
                  onChange={(e) => setGlobalFilterInput(e.target.value)}
                  placeholder="Search repositories..."
                  className="pl-9 h-9 w-full"
                />
              </div>
            </div>
          </SidebarGroupContent>

          <SidebarGroupContent className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
            <SidebarDatePicker date={date} onDateChange={navigateToDate} isIcon />
            <Popover>
              <PopoverTrigger
                render={
                  <Tooltip>
                    <TooltipTrigger render={
                      <Button variant="outline" size="icon" className="shrink-0 aria-expanded:bg-muted">
                        <Search className="size-4" />
                      </Button>
                    } />
                    <TooltipContent side="right">Search repositories</TooltipContent>
                  </Tooltip>
                }
              />
              <PopoverContent className="w-80 p-2" align="start">
                <Input
                  value={globalFilterInput}
                  onChange={(e) => setGlobalFilterInput(e.target.value)}
                  placeholder="Search repositories..."
                  className="h-9 w-full"
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Languages ({filteredGroups.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <TableOfContents groups={filteredGroups} activeId={activeId} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" />} tooltip="Home" className="h-auto items-center py-2">
              <img src="/daily.png" alt="logo" className="size-12 object-contain" />
              <div className="ml-auto flex flex-col text-right text-[10px] leading-tight text-muted-foreground group-data-[collapsible=icon]:hidden">
                <span className="text-foreground font-medium hover:text-primary transition-colors">Go to Home</span>
                <span>not affiliated with github</span>
                <span>use responsibly</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
