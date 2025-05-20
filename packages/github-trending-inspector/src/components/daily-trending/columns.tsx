'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Repository } from './types'
import { cn } from '$/lib/utils'
import { motion } from 'motion/react'
import { ColumnHeader } from './column-header'

export function createColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => <ColumnHeader title="Rank" type="number" isSortable sortDirection={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
      cell: ({ row }) => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tabular-nums">{row.getValue('rank')}</motion.div>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <ColumnHeader title="Repository" type="string" isSortable sortDirection={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
      cell: ({ row }) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group/link">
          <a href={row.original.url} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-2', 'text-foreground/90 hover:text-primary', 'transition-colors duration-200')}>
            <span className="group-hover/link:underline underline-offset-4">{row.getValue('title')}</span>
          </a>
        </motion.div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <ColumnHeader title="Description" type="text" isSortable sortDirection={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
      cell: ({ row }) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[500px] group/desc">
          <p className={cn('truncate text-muted-foreground/70', 'transition-colors duration-200', 'group-hover/desc:text-muted-foreground')}>{row.getValue('description')}</p>
        </motion.div>
      ),
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => <ColumnHeader title="Stars" type="number" isSortable sortDirection={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
      cell: ({ row }) => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tabular-nums">{row.getValue('stars')}</motion.div>,
    },
    {
      accessorKey: 'todayStars',
      header: ({ column }) => <ColumnHeader title="Today" type="number" isSortable sortDirection={column.getIsSorted()} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />,
      cell: ({ row }) => {
        const value = Number(row.getValue('todayStars'))
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tabular-nums">
            {!Number.isNaN(value) && (
              <>
                {value > 0 ? value : value}
                {' '}
                {Math.abs(value) === 1 ? 'star' : 'stars'}
              </>
            )}
          </motion.div>
        )
      },
    },
  ]
}
