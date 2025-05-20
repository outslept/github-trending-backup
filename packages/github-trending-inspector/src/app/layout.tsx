import type { Metadata } from 'next'
import { SidebarProvider } from '$/components/ui/sidebar'
import { DesignSystemProvider } from '$/providers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GitHub Trending Inspector',
  description: 'Inspect GitHub trending repositories with visualization',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <DesignSystemProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </DesignSystemProvider>
      </body>
    </html>
  )
}
