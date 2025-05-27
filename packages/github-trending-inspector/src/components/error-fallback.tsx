'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
        <AlertCircle className="size-10 text-destructive" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={resetErrorBoundary} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  )
}
