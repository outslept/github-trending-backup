import type { ReactNode } from 'react'
import { Toaster } from '$/components/ui/sonner'
import { ThemeProvider } from '$/providers/theme'

export function DesignSystemProvider({
  children,
  ...properties
}: { children: ReactNode }) {
  return (
    <ThemeProvider {...properties}>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
