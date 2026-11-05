import { useEffect, useMemo, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Search, X } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from './ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { SidebarDatePicker } from './sidebar-date-picker';
import { TableOfContents } from './table-of-contents';
import type { LanguageGroup } from '../lib/types';
import { formatNumber } from '../lib/utils';

interface AppSidebarProps {
  date: string;
  filteredGroups: LanguageGroup[];
  globalFilterInput: string;
  setGlobalFilterInput: (v: string) => void;
  navigateToDate: (iso: string) => void;
  activeId: string | null;
}

export function AppSidebar({
  date,
  filteredGroups,
  globalFilterInput,
  setGlobalFilterInput,
  navigateToDate,
  activeId,
}: AppSidebarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalReposCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.repos.length, 0),
    [filteredGroups],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-md py-0.5 pr-1.5 outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:hidden"
          >
            <img
              src="/daily.png"
              alt="GitHub Trending Inspector"
              width={22}
              height={22}
              className="size-5.5 shrink-0 object-contain"
            />
            <span className="truncate text-xs font-semibold tracking-tight text-foreground">
              Trending Inspector
            </span>
          </Link>

          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger className="size-7 shrink-0" />} />
            <TooltipContent side="right">
              <span>Toggle sidebar</span>
              <kbd className="ml-1.5 rounded bg-background/20 px-1 py-0.5 font-mono text-[10px]">
                ⌘B
              </kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <SidebarDatePicker date={date} onDateChange={navigateToDate} />

          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={globalFilterInput}
              onChange={(e) => setGlobalFilterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setGlobalFilterInput('');
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Filter repositories..."
              className="h-8 w-full rounded-lg border border-border/80 bg-background pl-8 pr-7 text-xs text-foreground shadow-2xs outline-none transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            {globalFilterInput ? (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => {
                  setGlobalFilterInput('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-1.5 flex size-5 items-center justify-center rounded-md text-muted-foreground transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-foreground active:scale-[0.92]"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 flex h-4 items-center rounded border border-border/70 bg-muted/50 px-1 font-mono text-[10px] text-muted-foreground">
                /
              </kbd>
            )}
          </div>
        </div>

        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-1.5">
          <SidebarDatePicker date={date} onDateChange={navigateToDate} isIcon />

          <Popover>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Filter repositories"
                        className="relative size-8 shrink-0 bg-background shadow-2xs aria-expanded:bg-muted"
                      >
                        <Search className="size-4 text-muted-foreground" />
                        {globalFilterInput && (
                          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-500" />
                        )}
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="right">Filter repositories</TooltipContent>
            </Tooltip>

            <PopoverContent className="w-64 p-2" align="start" side="right">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={globalFilterInput}
                  onChange={(e) => setGlobalFilterInput(e.target.value)}
                  placeholder="Filter repositories..."
                  autoFocus
                  className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-7 text-xs text-foreground outline-none focus-visible:border-ring"
                />
                {globalFilterInput && (
                  <button
                    type="button"
                    aria-label="Clear filter"
                    onClick={() => setGlobalFilterInput('')}
                    className="absolute right-1.5 flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span>Languages</span>
            <span className="font-mono text-[11px] tabular-nums text-sidebar-foreground/50">
              {filteredGroups.length}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <TableOfContents groups={filteredGroups} activeId={activeId} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-sidebar-accent hover:text-foreground active:scale-[0.97]"
                >
                  <ArrowLeft className="size-3.5 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Archive Home</span>
                </Link>
              }
            />
            <TooltipContent side="right">Back to Archive Home</TooltipContent>
          </Tooltip>

          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
            {formatNumber(totalReposCount)} repos
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
