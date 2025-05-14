'use client'

import type { Table } from '@tanstack/react-table'
import type { Repository } from '../types'
import { Button } from '$/components/ui/button'
import { cn } from '$/lib/utils'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'

interface PaginationProps {
  table: Table<Repository>
  language: string
}

export function Pagination({ table, language }: Readonly<PaginationProps>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const hasPrevious = table.getCanPreviousPage()
  const hasNext = table.getCanNextPage()

  const githubUrl = `https://github.com/outslept/github-trending-backup/blob/master/data/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().toISOString().split('T')[0]}.md#${language.toLowerCase()}`

  return (
    <div className="flex items-center justify-between py-4">
      <motion.a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'text-sm text-muted-foreground/70',
          'hover:text-foreground',
          'transition-colors duration-200',
          'flex items-center gap-2',
          'group',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="hidden sm:inline">View on GitHub</span>
        <ExternalLink className={cn(
          'h-3 w-3 sm:h-4 sm:w-4',
          'transition-transform duration-200',
          'group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
        )}
        />
      </motion.a>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 sm:gap-6">
          <span className={cn(
            'text-xs sm:text-sm text-muted-foreground/80',
            'transition-opacity duration-200',
            'select-none tabular-nums',
          )}
          >
            <span className="hidden sm:inline">Page </span>
            {currentPage}
            /
            {totalPages}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!hasPrevious}
                className={cn(
                  'h-8 w-8 sm:h-9 sm:w-auto sm:px-4',
                  'group transition-all duration-200',
                  'hover:bg-muted/50',
                  'focus-visible:ring-1 focus-visible:ring-offset-1',
                  'disabled:opacity-50',
                  !hasPrevious && 'hover:bg-transparent',
                )}
              >
                <ChevronLeft className={cn(
                  'h-4 w-4',
                  'transition-transform duration-200',
                  'group-hover:-translate-x-0.5',
                )}
                />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!hasNext}
                className={cn(
                  'h-8 w-8 sm:h-9 sm:w-auto sm:px-4',
                  'group transition-all duration-200',
                  'hover:bg-muted/50',
                  'focus-visible:ring-1 focus-visible:ring-offset-1',
                  'disabled:opacity-50',
                  !hasNext && 'hover:bg-transparent',
                )}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className={cn(
                  'h-4 w-4',
                  'transition-transform duration-200',
                  'group-hover:translate-x-0.5',
                )}
                />
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
