import type { Metadata } from 'next'
import { AppProviders } from '@/components/AppProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'Abrium Frontend',
  description: 'Wallet connect + token risk-aware swap review UI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
