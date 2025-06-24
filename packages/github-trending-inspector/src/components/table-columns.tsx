import { ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber, getNumberValue } from "../lib/format";
import type { Repository } from "../lib/types";
import type { ColumnDef } from "@tanstack/react-table";

export function createColumns(): ColumnDef<Repository>[] {
  return [
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <SortableHeader column={column} label="rank" type="number" />
      ),
      cell: ({ row }) => (
        <div className="inline-flex items-center justify-center min-w-[2.5rem] h-6 px-2 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded-md hover:bg-muted transition-colors">
          #{formatNumber(row.getValue("rank"))}
        </div>
      ),
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: "repo",
      header: ({ column }) => (
        <SortableHeader column={column} label="repository" type="string" />
      ),
      cell: ({ row }) => (
        <a
          href={`https://github.com/${row.getValue("repo")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 min-w-0 max-w-[240px] text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
        >
          <span className="truncate">{row.getValue("repo")}</span>
          <div className="size-1 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </a>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "desc",
      header: () => (
        <div className="items-center gap-1.5 hidden lg:flex">
          <span className="text-sm font-medium text-muted-foreground tracking-tight">
            description
          </span>
          <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded">
            string
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <p className="hidden lg:block max-w-md text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 leading-relaxed truncate whitespace-nowrap overflow-hidden text-ellipsis">
          {row.getValue("desc") || "No description available"}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "stars",
      header: ({ column }) => (
        <SortableHeader column={column} label="stars" type="number" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-tight">
          {formatNumber(row.getValue("stars"))}
        </span>
      ),
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "forks",
      header: ({ column }) => (
        <SortableHeader column={column} label="forks" type="number" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-tight">
          {formatNumber(row.getValue("forks"))}
        </span>
      ),
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "today",
      header: ({ column }) => (
        <SortableHeader column={column} label="today" type="number" />
      ),
      cell: ({ row }) => {
        const today = getNumberValue(row.getValue("today"));
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-sm transition-colors duration-200 tracking-tight ${
                today > 0
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {today > 0 ? `+${formatNumber(today)}` : formatNumber(today)}
            </span>
            {today > 0 && (
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        );
      },
      enableSorting: true,
      size: 120,
    },
  ];
}

function SortableHeader({
  column,
  label,
  type,
}: {
  column: any;
  label: string;
  type: string;
}) {
  const sortDirection = column.getIsSorted?.() || false;

  return (
    <button
      onClick={() => {
        if (column.toggleSorting) {
          if (!sortDirection) {
            column.toggleSorting(false);
          } else if (sortDirection === "asc") {
            column.toggleSorting(true);
          } else {
            column.clearSorting();
          }
        }
      }}
      className="group flex items-center gap-2 hover:text-foreground transition-colors duration-200 -ml-2 pl-2 pr-1 py-1 rounded-md hover:bg-muted/50"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground tracking-tight">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/50 font-mono px-1 py-0.5 bg-muted/40 rounded group-hover:bg-muted/60 transition-colors">
          {type}
        </span>
      </div>

      <div className="size-4 flex items-center justify-center">
        {sortDirection === "asc" && (
          <ChevronUp className="size-3 text-primary" />
        )}
        {sortDirection === "desc" && (
          <ChevronDown className="size-3 text-primary" />
        )}
        {!sortDirection && (
          <div className="flex flex-col gap-0.5">
            <ChevronUp className="size-2 text-muted-foreground/30" />
            <ChevronDown className="size-2 text-muted-foreground/30" />
          </div>
        )}
      </div>
    </button>
  );
}
