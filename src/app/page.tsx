import { SwapWorkspace } from '@/components/SwapWorkspace'
import { WalletConnectCard } from '@/components/WalletConnectCard'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  return (
    <main className='mx-auto grid w-full max-w-[980px] gap-4 px-4 pb-20'>
      <header className='flex h-14 items-center justify-between border-b border-(--topbar-border)'>
        <div className='text-sm text-(--crumbs)'>App &gt; Swap</div>
        <div className='flex items-center gap-2.5'>
          <ThemeToggle />
          <WalletConnectCard />
        </div>
      </header>
      <div className='flex w-full justify-center'>
        <SwapWorkspace />
      </div>
    </main>
  )
}
