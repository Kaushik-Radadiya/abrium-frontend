'use client';

import { useRouter } from 'next/navigation';
import { useSwapReviewStore } from '@/lib/swapReviewStore';
import { SwapReviewPanel } from '@/components/trade/swap/SwapReviewPanel';

export default function SwapReviewPage() {
  const router = useRouter();
  const { review } = useSwapReviewStore();

  if (!review) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
        <p className='text-sm text-white/40'>No route selected.</p>
        <button
          onClick={() => router.push('/swap')}
          className='rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500'
        >
          Back to Swap
        </button>
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
