import type { ReactNode } from 'react'

import { TooltipProvider } from '../components/ui/tooltip'

import { QueryProvider } from './query'

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryProvider>
  )
}
