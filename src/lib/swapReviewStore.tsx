'use client';

import { createContext, useContext, useState } from 'react';
import type { SwapQuoteResponsePayload } from '@/lib/quotes.types';

type SwapReviewPayload = {
  quote: SwapQuoteResponsePayload;
  fromSymbol: string;
  toSymbol: string;
  fromDecimals: number;
  toDecimals: number;
};

type SwapReviewStore = {
  review: SwapReviewPayload | null;
  setReview: (review: SwapReviewPayload | null) => void;
};

const SwapReviewContext = createContext<SwapReviewStore>({
  review: null,
  setReview: () => {},
});

export function SwapReviewProvider({ children }: { children: React.ReactNode }) {
  const [review, setReview] = useState<SwapReviewPayload | null>(null);
  return (
    <SwapReviewContext.Provider value={{ review, setReview }}>
      {children}
    </SwapReviewContext.Provider>
  );
}

export function useSwapReviewStore() {
  return useContext(SwapReviewContext);
}
