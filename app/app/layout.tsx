import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/legal/cookie-consent'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Prestige Car Wash by Ekhaya - Where Waiting Becomes Productive",
  description: "Premium car wash services in Cape Town with productive customer lounge experience. Express, Premium, Deluxe, and Executive car detailing services.",
  keywords: "car wash, Cape Town, premium car care, detailing, productive lounge",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} page-entrance`} suppressHydrationWarning>
        <Providers>
          {children}
          <CookieConsent />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}