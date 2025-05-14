'use client'

import { cn } from '$/lib/utils'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface ColumnHeaderProps {
  title: string
  type?: string
  isSortable?: boolean
  sortDirection?: 'asc' | 'desc' | false
  onClick?: () => void
}

export function ColumnHeader({
  title,
  type,
  isSortable,
  sortDirection,
  onClick,
}: Readonly<ColumnHeaderProps>) {
  return (
    <div className="h-10 text-left align-middle font-medium">
      <motion.button
        type="button"
        className={cn(
          'flex items-center justify-between gap-1 w-full px-2 py-1 rounded-md -mx-2',
          'transition-all duration-200 ease-out',
          isSortable && [
            'cursor-pointer',
            'hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-1',
            'focus-visible:ring-ring focus-visible:ring-offset-1',
          ],
        )}
        onClick={onClick}
        disabled={!isSortable}
        whileHover={isSortable ? { scale: 1.02 } : undefined}
        whileTap={isSortable ? { scale: 0.98 } : undefined}
      >
        <div className="flex items-center">
          <motion.span
            className={cn(
              'text-xs font-medium lowercase',
              'transition-colors duration-200',
              isSortable && 'group-hover:text-foreground',
            )}
            animate={{
              color: sortDirection ? 'var(--primary)' : 'inherit',
            }}
          >
            {title}
          </motion.span>
          {type && (
            <motion.span
              className={cn(
                'ml-2 font-mono text-[10px]',
                'text-muted-foreground/50 lowercase',
                'transition-colors duration-200',
                isSortable && 'group-hover:text-muted-foreground/70',
              )}
            >
              {type.toLowerCase()}
            </motion.span>
          )}
        </div>
        {isSortable && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sortDirection || 'none'}
              initial={{ rotate: sortDirection === 'asc' ? -180 : 0 }}
              animate={{ rotate: sortDirection === 'asc' ? 180 : 0 }}
              exit={{ rotate: sortDirection === 'asc' ? -180 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
            >
              <ChevronDown
                className={cn(
                  'h-3 w-3',
                  'text-muted-foreground/70',
                  'transition-colors duration-200',
                )}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.button>
    </div>
  )
}
