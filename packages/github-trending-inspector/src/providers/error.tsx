'use client'

import type { ReactNode } from 'react'
import { ErrorFallback } from '$/components/error-fallback'
import { ErrorBoundary } from 'react-error-boundary'

export function ErrorProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  )
}
