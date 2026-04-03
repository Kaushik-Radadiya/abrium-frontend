import { HistoryFilters } from '@/components/history/HistoryFilters';
import { HistoryTable } from '@/components/history/HistoryTable';
import { HistoryItem } from '@/components/history/types';

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: '1',
    date: 'Dec 14, 15:10',
    type: 'Swap',
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '+2,500 USDC',
    amountSubtext: '-1 ETH',
    duration: '1m 46s',
    status: 'Pending',
  },
  {
    id: '2',
    date: 'Dec 14, 15:10',
    type: 'Bridge',
    fromToken: 'USDC',
    toToken: 'ETH',
    amount: '+2,500 ETH',
    amountSubtext: '-10 USDC',
    duration: '1m 46s',
    status: 'Completed',
  },
  {
    id: '3',
    date: 'Dec 14, 15:10',
    type: 'Hydra',
    fromToken: 'USDC',
    toToken: 'USDC',
    amount: '+2,500 USDC',
    amountSubtext: '-10 USDC',
    duration: '1m 46s',
    status: 'Failed',
  },
  {
    id: '4',
    date: 'Dec 14, 15:10',
    type: 'DCA',
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '+2,500 USDC',
    amountSubtext: '-10 ETH',
    duration: '1m 46s',
    status: 'Completed',
  },
  {
    id: '5',
    date: 'Dec 14, 15:10',
    type: 'Limit',
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '+2,500 USDC',
    amountSubtext: '-10 ETH',
    duration: '1m 46s',
    status: 'Completed',
  },
];

export function HistoryPageView() {
  return (
    <main className='mx-auto w-full px-4 py-6 sm:px-6'>
      {/* <div className='mb-4 flex items-center justify-end'>
        <Button className='rounded-full border border-(--neutral-border) bg-(--neutral-background-raised) px-4 py-2 text-sm'>
          <Download className='size-4' />
          Export
        </Button>
      </div> */}

      <section className='space-y-4'>
        <HistoryFilters />
        <HistoryTable items={HISTORY_ITEMS} />
      </section>
    </main>
  );
}
