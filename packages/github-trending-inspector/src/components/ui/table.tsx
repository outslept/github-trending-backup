import * as React from 'react'

import { cn } from '../../lib/utils'

function Table ({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className='overflow-hidden'>
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader ({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={cn('', className)} {...props} />
}

function TableBody ({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('', className)} {...props} />
}

function TableRow ({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-border/40 transition-colors duration-200',
        className
      )}
      {...props}
    />
  )
}

function TableHead ({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left font-medium text-muted-foreground text-sm tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function TableCell ({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn('px-4 py-3 text-foreground text-sm', className)}
      {...props}
    />
  )
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
