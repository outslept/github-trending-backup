import type { ReactNode } from 'react'

import { TooltipProvider } from '../components/ui/tooltip'

import { ErrorProvider } from './error'
import { QueryProvider } from './query'

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <QueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryProvider>
    </ErrorProvider>
  )
}
