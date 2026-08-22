import { Code } from 'lucide-react'
import { useState } from 'react'

import { languageIcons } from '../lib/language-icons'
import { slugify } from '../lib/slug'
import { formatNumber } from '../lib/format'

interface TableHeaderProps {
  language: string
  repoCount: number
}

export function TableHeader({ language, repoCount }: TableHeaderProps) {
  const [imageError, setImageError] = useState(false)
  const languageId = slugify(language)
  const iconSrc = languageIcons[language.toLowerCase()]

  return (
    <div id={languageId} className="scroll-mt-16 pb-3">
      <div className="flex items-center gap-2">
        {iconSrc && !imageError ? (
          <img
            src={iconSrc}
            alt={language}
            width={20}
            height={20}
            onError={() => setImageError(true)}
          />
        ) : (
          <Code className="size-5 text-muted-foreground" />
        )}
        <a href={`#${languageId}`} className="group">
          <h2 className="text-base font-semibold tracking-tight group-hover:underline underline-offset-4">
            {language}
          </h2>
        </a>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatNumber(repoCount)}
        </span>
      </div>
    </div>
  )
}
