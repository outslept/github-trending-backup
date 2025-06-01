import type { ReactNode } from 'react'
import { ErrorProvider } from '$/providers/error'
import { QueryProvider } from '$/providers/query'
import { ThemeProvider } from '$/providers/theme'

export function DesignSystemProvider({
  children,
}: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryProvider>
    </ErrorProvider>
  )
}
