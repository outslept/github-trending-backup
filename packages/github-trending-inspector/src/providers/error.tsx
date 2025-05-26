'use client'

import { ErrorFallback } from '$/components/error-fallback'
import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'

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
