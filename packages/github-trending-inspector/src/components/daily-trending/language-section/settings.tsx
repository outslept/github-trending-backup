"use client"

import { Settings, FileJson, FileText, Hash, Star, TrendingUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "$/components/ui/dropdown-menu"
import { Table } from "@tanstack/react-table"
import { Repository } from "../types"
import { exportToCsv, exportToJson } from "../export"
import { motion } from "motion/react"
import { cn } from "$/lib/utils"

interface SettingsProps {
  table: Table<Repository>
  group: {
    language: string
    repos: Repository[]
  }
}

export function SettingsDropdown({ table, group }: Readonly<SettingsProps>) {
  const hideableColumns = [
    { id: "rank", label: "Rank", icon: Hash },
    { id: "description", label: "Description", icon: FileText },
    { id: "stars", label: "Stars", icon: Star },
    { id: "todayStars", label: "Today Stars", icon: TrendingUp },
  ]

  const handleExport = async (type: 'json' | 'csv') => {
    try {
      if (type === 'json') {
        exportToJson(group.repos, `${group.language}-repos.json`)
      } else {
        exportToCsv(group.repos, `${group.language}-repos.csv`)
      }
    } catch (error) {
      console.error(`Failed to export as ${type}:`, error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "p-1.5 rounded-full",
            "hover:bg-muted/50",
            "transition-colors duration-200"
          )}
        >
          <Settings className="h-4 w-4 text-muted-foreground/70" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-[200px]",
          "animate-in fade-in-0 zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2"
        )}
      >
        <DropdownMenuLabel className="text-xs font-medium">
          Table Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          className="group cursor-pointer"
        >
          <FileJson className={cn(
            "mr-2 h-4 w-4",
            "transition-colors duration-200",
            "group-hover:text-primary"
          )} />
          <span className="group-hover:text-primary transition-colors">
            Export to JSON
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="group cursor-pointer"
        >
          <FileText className={cn(
            "mr-2 h-4 w-4",
            "transition-colors duration-200",
            "group-hover:text-primary"
          )} />
          <span className="group-hover:text-primary transition-colors">
            Export to CSV
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium">
          Toggle Columns
        </DropdownMenuLabel>
        {hideableColumns.map((column) => {
          const tableColumn = table.getColumn(column.id)
          if (!tableColumn) return null

          const Icon = column.icon
          const isVisible = tableColumn.getIsVisible()

          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={isVisible}
              onCheckedChange={(value) => tableColumn.toggleVisibility(!!value)}
              className="group cursor-pointer"
            >
              <Icon className={cn(
                "mr-2 h-4 w-4",
                "transition-colors duration-200",
                isVisible ? "text-foreground" : "text-muted-foreground/50",
                "group-hover:text-primary"
              )} />
              <span className={cn(
                "transition-colors duration-200",
                isVisible ? "text-foreground" : "text-muted-foreground/50",
                "group-hover:text-primary"
              )}>
                {column.label}
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
