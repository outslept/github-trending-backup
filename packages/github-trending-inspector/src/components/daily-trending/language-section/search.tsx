'use client'

import type { Table } from '@tanstack/react-table'
import type { Repository } from '../types'
import { Input } from '$/components/ui/input'
import { Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'

interface SearchProps {
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  table: Table<Repository>
}

export function Searchbar({ showSearch, setShowSearch, table }: Readonly<SearchProps>) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        table.getColumn('title')?.setFilterValue('')
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showSearch, setShowSearch, table])

  return (
    <AnimatePresence mode="wait">
      {showSearch
        ? (
            <motion.div
              key="search-input"
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="relative flex items-center"
            >
              <Input
                ref={inputRef}
                placeholder="Search..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={event => table.getColumn('title')?.setFilterValue(event.target.value)}
                className="h-8 w-[120px] sm:w-[150px] lg:w-[250px] pl-7 pr-7 text-sm"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70 pointer-events-none" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowSearch(false)
                  table.getColumn('title')?.setFilterValue('')
                }}
                className="absolute right-2 p-1 rounded-full hover:bg-muted/50 transition-colors duration-200"
              >
                <X className="h-3 w-3 text-muted-foreground/70" />
              </motion.button>
            </motion.div>
          )
        : (
            <motion.button
              key="search-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSearch(true)}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors duration-200 flex-shrink-0"
            >
              <Search className="h-4 w-4 text-muted-foreground/70" />
            </motion.button>
          )}
    </AnimatePresence>
  )
}
