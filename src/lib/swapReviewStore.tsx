'use client';

import { createContext, useContext, useState } from 'react';
import type { NormalizedRoute } from '@/lib/routeDecisionService';

type SwapReviewPayload = {
  bestRoute: NormalizedRoute;
  fromAmountUSD: number | null;
  toAmountUSD: number | null;
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
