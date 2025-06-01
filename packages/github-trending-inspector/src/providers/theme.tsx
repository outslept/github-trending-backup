'use client'

import type { ThemeProviderProps } from 'next-themes'
import { ThemeProvider as StaticProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import * as React from 'react'

const DynProvider = dynamic(
  () => import('next-themes').then(e => e.ThemeProvider),
  {
    ssr: false,
  },
)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const NextThemeProvider = process.env.NODE_ENV === 'production' ? StaticProvider : DynProvider

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
}
