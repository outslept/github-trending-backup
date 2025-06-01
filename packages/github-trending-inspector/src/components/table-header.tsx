import { languageIcons } from '$/lib/constants'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { Input } from './ui/input'

interface TableHeaderProps {
  language: string
  repoCount: number
  globalFilter: string
  onFilterChange: (value: string) => void
}

export function TableHeader({
  language,
  repoCount,
  globalFilter,
  onFilterChange,
}: TableHeaderProps) {
  return (
    <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <a
        href={`#${language.toLowerCase()}`}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Image
          src={languageIcons[language.toLowerCase()] || '/icons/_file.svg'}
          alt={language}
          width={16}
          height={16}
          className="size-4"
        />
        <span className="text-sm font-medium text-foreground">{language}</span>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5">
          {repoCount}
        </span>
      </a>

      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={e => onFilterChange(e.target.value)}
          className="h-7 w-full sm:w-48 pl-7 pr-7 text-xs"
        />
        {globalFilter && (
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onFilterChange('')}
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </div>
  )
}
