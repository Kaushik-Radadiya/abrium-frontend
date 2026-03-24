'use client';

import { useRouter } from 'next/navigation';
import { useSwapReviewStore } from '@/lib/swapReviewStore';
import { SwapReviewPanel } from '@/components/trade/swap/SwapReviewPanel';

export default function SwapReviewInterceptedPage() {
  const router = useRouter();
  const { review } = useSwapReviewStore();

  if (!review) {
    router.replace('/swap/review');
    return null;
  }

  return (
    <SwapReviewPanel
      open
      quote={review.quote}
      fromSymbol={review.fromSymbol}
      toSymbol={review.toSymbol}
      fromDecimals={review.fromDecimals}
      toDecimals={review.toDecimals}
      onClose={() => router.back()}
      onConfirm={() => router.back()}
    />
  );
}
