import type { LanguageGroup } from '$/lib/types'
import { LanguageSection } from './language-section'

interface TrendingContentProps {
  groups: LanguageGroup[]
}

export function TrendingContent({ groups }: TrendingContentProps) {
  return (
    <div className="space-y-6">
      {groups.map(group => (
        <LanguageSection key={group.language} group={group} />
      ))}
    </div>
  )
}
