import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nuttin OS',
  description: 'Persoonlijk dashboard — financiën, gezondheid, productiviteit',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nuttin OS',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFBFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0C' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
