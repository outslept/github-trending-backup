"use client"

import { Badge } from "$/components/ui/badge"
import { Hash } from "lucide-react"
import { Searchbar } from "./search"
import { SettingsDropdown } from "./settings"
import { Table } from "@tanstack/react-table"
import { Repository } from "../types"
import { cn } from "$/lib/utils"

interface HeaderProps {
  group: {
    language: string
    repos: Repository[]
  }
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  table: Table<Repository>
  languageIcon: string
}

export function Header({
  group,
  showSearch,
  setShowSearch,
  table,
  languageIcon
}: Readonly<HeaderProps>) {
  const languageAnchor = group.language.toLowerCase().replace(/\s+/g, '-')

  const handleAnchorClick = () => {
    const url = `${window.location.href.split('#')[0]}#${languageAnchor}`
    window.history.pushState({}, '', url)
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 group/badge relative">
        <Badge
          variant="outline"
          onClick={handleAnchorClick}
          className={cn(
            "flex items-center gap-2 font-medium cursor-pointer",
            "transition-all duration-200 ease-out",
            "hover:bg-muted/50 hover:border-border/80",
            "group-hover/badge:shadow-sm"
          )}
        >
          <div className="relative w-4 h-4 overflow-hidden">
            <img
              src={languageIcon}
              alt={group.language}
              className={cn(
                "absolute inset-0 h-4 w-4",
                "opacity-80 grayscale",
                "transition-all duration-300",
                "group-hover/badge:opacity-100 group-hover/badge:grayscale-0"
              )}
              loading="lazy"
            />
          </div>
          <span className="hidden sm:inline">{group.language}</span>
          <span className={cn(
            "font-mono text-xs",
            "text-muted-foreground/80",
            "transition-all duration-200",
            "group-hover/badge:text-muted-foreground",
            "sm:ml-1"
          )}>
            {group.repos.length}
          </span>
        </Badge>
        <div
          onClick={handleAnchorClick}
          className={cn(
            "p-1 rounded-md cursor-pointer",
            "opacity-0 scale-95",
            "transition-all duration-200 ease-out",
            "group-hover/badge:opacity-100 group-hover/badge:scale-100",
            "hover:bg-muted/50",
            "focus-visible:opacity-100 focus-visible:scale-100",
            "focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "hidden sm:block"
          )}
        >
          <Hash className={cn(
            "h-4 w-4",
            "text-muted-foreground/50",
            "transition-colors duration-200",
            "hover:text-muted-foreground"
          )} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Searchbar
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          table={table}
        />
        <div className="w-px h-6 bg-border/50 mx-2 flex-shrink-0" />
        <SettingsDropdown table={table} group={group} />
      </div>
    </div>
  )
}
