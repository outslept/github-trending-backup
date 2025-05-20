'use client'

import type { Table } from '@tanstack/react-table'
import type { Repository } from '../types'
import { Button } from '$/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

interface PaginationProps {
  table: Table<Repository>
}

export function Pagination({ table }: Readonly<PaginationProps>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const hasPrevious = table.getCanPreviousPage()
  const hasNext = table.getCanNextPage()

  return (
    <div className="flex justify-end py-4">
      {totalPages > 1 && (
        <div className="flex items-center gap-2 sm:gap-6">
          <span className="text-xs sm:text-sm text-muted-foreground/80 transition-opacity duration-200 select-none tabular-nums">
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
                className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-4 group transition-all duration-200 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-offset-1 disabled:opacity-50 ${!hasPrevious && 'hover:bg-transparent'}`}
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!hasNext}
                className={`h-8 w-8 sm:h-9 sm:w-auto sm:px-4 group transition-all duration-200 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-offset-1 disabled:opacity-50 ${!hasNext && 'hover:bg-transparent'}`}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
