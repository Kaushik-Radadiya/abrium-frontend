import type { Metadata } from 'next'
import { AppProviders } from '@/components/AppProviders'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Abrium Frontend',
  description: 'Wallet connect + token risk-aware swap review UI'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='flex h-screen overflow-hidden bg-(--bg) text-(--text) antialiased'>
        <AppProviders>
          <Sidebar />
          <div className='flex-1 overflow-auto'>{children}</div>
        </AppProviders>
      </body>
    </html>
  )
}
