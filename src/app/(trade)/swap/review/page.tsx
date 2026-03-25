'use client';

import { useRouter } from 'next/navigation';
import { useSwapReviewStore } from '@/lib/swapReviewStore';
import { SwapReviewPanel } from '@/components/trade/swap/SwapReviewPanel';
import { Button } from '@/components/ui/Button';

export default function SwapReviewPage() {
  const router = useRouter();
  const { review } = useSwapReviewStore();

  if (!review) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
        <p className='text-sm text-white/40'>No route selected.</p>
        <Button className='py-3! px-5!' onClick={() => router.push('/swap')}>
          Back to Swap
        </Button>
      </div>
    );
  }

  return (
    <SwapReviewPanel
      open
      bestRoute={review.bestRoute}
      fromAmountUSD={review.fromAmountUSD}
      toAmountUSD={review.toAmountUSD}
      fromSymbol={review.fromSymbol}
      toSymbol={review.toSymbol}
      fromDecimals={review.fromDecimals}
      toDecimals={review.toDecimals}
      onClose={() => router.push('/swap')}
      onConfirm={() => router.push('/swap')}
    />
  );
}
