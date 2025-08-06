import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Ekhaya Intel Car Wash - Where Waiting Becomes Productive",
  description: "Premium car wash services in Cape Town with productive customer lounge experience. Express, Premium, Deluxe, and Executive car detailing services.",
  keywords: "car wash, Cape Town, premium car care, detailing, productive lounge",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}