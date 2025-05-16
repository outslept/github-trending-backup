import type { ReactNode } from 'react'
import { Toaster } from '$/components/ui/sonner'
import { TooltipProvider } from '$/components/ui/tooltip'
import { ThemeProvider } from '$/providers/theme'

export function DesignSystemProvider({
  children,
  ...properties
}: { children: ReactNode }) {
  return (
    <ThemeProvider {...properties}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}
