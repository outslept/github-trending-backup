"use client"

import * as React from "react"
import { cn } from "$/lib/utils"
import { ChevronDown } from "lucide-react"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-md border"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          "border-collapse",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-muted/50",
        "[&_tr]:border-b",
        "[&_tr]:border-border/50",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        "[&_tr:hover]:bg-muted/50",
        "[&_tr]:border-b",
        "[&_tr]:border-border/50",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50",
        "border-t",
        "border-border/50",
        "font-medium",
        "[&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors",
        "hover:bg-muted/50",
        "data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  type,
  children,
  isSortable,
  sortDirection,
  ...props
}: React.ComponentProps<"th"> & {
  type?: string
  isSortable?: boolean
  sortDirection?: 'asc' | 'desc' | false
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10",
        "px-4",
        "text-left",
        "align-middle",
        "font-medium",
        "text-muted-foreground",
        "border-r",
        "border-border/50",
        "last:border-r-0",
        isSortable && "cursor-pointer group",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex items-center justify-between gap-1",
        isSortable && "group-hover:text-foreground transition-colors"
      )}>
        <div className="flex items-center">
          <span className="text-xs font-medium lowercase">{children}</span>
          {type && (
            <span
              className="ml-2 font-mono text-[10px] text-muted-foreground/50 lowercase"
            >
              {type.toLowerCase()}
            </span>
          )}
        </div>
        {isSortable && (
          <ChevronDown
            className={cn(
              "h-3 w-3",
              "text-muted-foreground/70",
              "transition-transform",
              sortDirection === 'asc' && "rotate-180",
              !sortDirection && "opacity-0 group-hover:opacity-100"
            )}
          />
        )}
      </div>
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2",
        "align-middle",
        "border-r",
        "border-border/50",
        "last:border-r-0",
        "[&:has([role=checkbox])]:pr-0",
        "[&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4",
        "text-sm",
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
