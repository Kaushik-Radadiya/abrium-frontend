import type { Metadata } from 'next';
import { AppProviders } from '@/components/AppProviders';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WalletConnectCard } from '@/components/WalletConnectCard';
import { ChevronRight } from 'lucide-react';
import { inter } from '@/style/font';

export const metadata: Metadata = {
  title: 'Abrium | High-Performance Token Execution',
  description:
    'The Abrium V12 Engine provides real-time liquidity aggregation, intent-based routing, and cross-chain bridging with institutional reliability.',
  keywords: [
    'DeFi',
    'Token Swap',
    'Liquidity Aggregator',
    'Cross-chain Bridge',
    'Abrium V12',
    'Permit2',
  ],
  openGraph: {
    title: 'Abrium | High-Performance Token Execution',
    description: 'High-performance digital asset execution engine.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body
        className="flex h-screen overflow-hidden bg-(--bg) text-(--text) antialiased"
        suppressHydrationWarning
      >
        <AppProviders>
          <Sidebar />
          <div className="flex flex-col h-full w-full">
            <header className="flex w-full px-6 py-3 items-center justify-between border-b border-(--topbar-border)">
              <div className="text-base text-(--neutral-text-textWeak) flex items-center gap-3">
                App
                <ChevronRight width={16} height={16} />
                <span className="text-(--neutral-text-textStrong)">Swap</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ThemeToggle />
                <WalletConnectCard />
              </div>
            </header>
            <div className="overflow-auto">{children}</div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
