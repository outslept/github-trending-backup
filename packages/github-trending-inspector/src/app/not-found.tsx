import { Button } from '$/components/ui/button'
import { ArrowLeft, Search, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Terminal Window */}
        <div className="border bg-background">
          {/* Terminal Header */}
          <div className="border-b p-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">system_error.log</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 bg-muted"></div>
              <div className="w-2 h-2 bg-muted"></div>
              <div className="w-2 h-2 bg-muted"></div>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-4 font-mono text-sm space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-green-500">user</span>
              <span className="text-muted-foreground">$</span>
              <span className="break-all">
                curl -I
                {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
              </span>
            </div>

            <div className="space-y-1 text-muted-foreground pl-4 text-xs">
              <div>HTTP/1.1 404 Not Found</div>
              <div>Server: trending-inspector/1.0</div>
              <div>Content-Type: application/json</div>
            </div>

            <div className="border-l-2 border-destructive pl-3 py-2 bg-destructive/5">
              <div className="text-destructive font-bold text-xl sm:text-2xl mb-1">404</div>
              <div className="text-muted-foreground text-sm">The requested page could not be found</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-green-500">user</span>
              <span className="text-muted-foreground">$</span>
              <span>cd /</span>
              <span className="ml-1 w-2 h-4 bg-foreground inline-block"></span>
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="border-t p-3 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-start gap-2 font-mono text-xs"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-3 w-3" />
                cd /home
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex-1 justify-start gap-2 font-mono text-xs"
              asChild
            >
              <Link href="/?date=today">
                <Search className="h-3 w-3" />
                ./trending --today
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
