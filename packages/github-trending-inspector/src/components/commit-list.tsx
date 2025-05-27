import type { Commit } from '$/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '$/components/ui/avatar'

interface CommitListProps {
  commits: Commit[]
}

function CommitItem({ commit }: { commit: Commit }) {
  const days = Math.floor((Date.now() - new Date(commit.commit.author.date).getTime()) / (1000 * 60 * 60 * 24))
  const timeAgo = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`

  return (
    <button
      onClick={() => window.open(`https://github.com/outslept/github-trending-backup/commit/${commit.sha}`, '_blank')}
      className="w-full flex items-start gap-2 p-2 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
    >
      <Avatar className="size-6 flex-shrink-0">
        <AvatarImage src={commit.author?.avatar_url} alt={commit.commit.author.name} />
        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
          {commit.commit.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5">
            {commit.sha.slice(0, 7)}
          </code>
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-xs text-foreground line-clamp-2 leading-tight">
          {commit.commit.message}
        </p>
      </div>
    </button>
  )
}

export function CommitList({ commits }: CommitListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex-shrink-0">
        <h3 className="text-xs font-medium text-muted-foreground">Recent Activity</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        {commits.map(commit => (
          <CommitItem key={commit.sha} commit={commit} />
        ))}
      </div>
    </div>
  )
}
