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

export function TableHeader({ language, repoCount, globalFilter, onFilterChange }: TableHeaderProps) {
  return (
    <div className="p-3 sm:p-4 border-b">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <LanguageInfo language={language} count={repoCount} />
        <SearchInput
          value={globalFilter}
          onChange={onFilterChange}
        />
      </div>
    </div>
  )
}

function LanguageInfo({ language, count }: { language: string, count: number }) {
  return (
    <a
      href={`#${language.toLowerCase()}`}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Image
        src={languageIcons[language.toLowerCase()] || '/icons/_file.svg'}
        alt={language}
        width={16}
        height={16}
        className="h-4 w-4"
      />
      <span className="text-sm font-medium text-foreground">{language}</span>
      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5">
        {count}
      </span>
    </a>
  )
}

function SearchInput({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-7 w-full sm:w-48 pl-7 pr-7 text-xs"
      />
      {value && (
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onChange('')}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
