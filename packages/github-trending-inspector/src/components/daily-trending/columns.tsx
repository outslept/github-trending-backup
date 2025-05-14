'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Repository } from './types'
import { cn } from '$/lib/utils'
import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { ColumnHeader } from './column-header'

export function createColumns(onToggleStar: (repo: Repository) => Promise<void>, session: any): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: 'rank',
      header: ({ column }) => (
        <ColumnHeader
          title="Rank"
          type="number"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="tabular-nums"
        >
          {row.getValue('rank')}
        </motion.div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <ColumnHeader
          title="Repository"
          type="string"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="group/link"
        >
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2',
              'text-foreground/90 hover:text-primary',
              'transition-colors duration-200',
            )}
          >
            <span className="group-hover/link:underline underline-offset-4">
              {row.getValue('title')}
            </span>
          </a>
        </motion.div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <ColumnHeader
          title="Description"
          type="text"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-[500px] group/desc"
        >
          <p className={cn(
            'truncate text-muted-foreground/70',
            'transition-colors duration-200',
            'group-hover/desc:text-muted-foreground',
          )}
          >
            {row.getValue('description')}
          </p>
        </motion.div>
      ),
    },
    {
      accessorKey: 'stars',
      header: ({ column }) => (
        <ColumnHeader
          title="Stars"
          type="number"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="tabular-nums"
        >
          {row.getValue('stars')}
        </motion.div>
      ),
    },
    {
      accessorKey: 'todayStars',
      header: ({ column }) => (
        <ColumnHeader
          title="Today"
          type="number"
          isSortable
          sortDirection={column.getIsSorted()}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const rawValue = row.getValue('todayStars')
        const value = typeof rawValue === 'string' ? Number.parseInt(rawValue, 10) : Number(rawValue)

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="tabular-nums"
          >
            {!Number.isNaN(value) && (
              <>
                {value > 0 ? `${value}` : value}
                {' '}
                {Math.abs(value) === 1 ? 'star' : 'stars'}
              </>
            )}
          </motion.div>
        )
      },
    },
    {
      id: 'actions',
      header: () => (
        <ColumnHeader title="Actions" />
      ),
      cell: ({ row }) => {
        if (!session?.user)
          return null

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-right"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={row.original.isStarred ? 'secondary' : 'default'}
                onClick={() => onToggleStar(row.original)}
                className={cn(
                  'w-24 group',
                  'transition-all duration-200',
                  'hover:shadow-sm',
                )}
              >
                <Star
                  className={cn(
                    'mr-2 h-4 w-4',
                    'transition-colors duration-200',
                    row.original.isStarred
                      ? 'text-yellow-500'
                      : 'text-muted-foreground group-hover:text-yellow-500',
                  )}
                />
                <span className={cn(
                  'transition-colors duration-200',
                  row.original.isStarred
                    ? 'text-muted-foreground'
                    : 'text-primary-foreground',
                )}
                >
                  {row.original.isStarred ? 'Unstar' : 'Star'}
                </span>
              </Button>
            </motion.div>
          </motion.div>
        )
      },
    },
  ]
}
