import type { Metadata } from 'next'
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
  title: {
    template: 'GitHub Trending Inspector',
    default: 'GitHub Trending Inspector',
  },
  description: 'Explore GitHub trending repositories with historical data and insights',
  keywords: ['github', 'trending', 'repositories', 'open source', 'development', 'programming'],
  authors: [{ name: 'outslept' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'GitHub Trending Inspector',
    description: 'Explore GitHub trending repositories with historical data and insights',
    type: 'website',
    siteName: 'GitHub Trending Inspector',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Trending Inspector',
    description: 'Explore GitHub trending repositories with historical data and insights',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <DesignSystemProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </DesignSystemProvider>
      </body>
    </html>
  )
}
