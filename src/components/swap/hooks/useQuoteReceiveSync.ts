'use client';

import { useEffect } from 'react';
import type { SwapQuoteResponsePayload } from '@/lib/quotes.types';
import type { UiToken } from '@/lib/tokens';
import { formatAmountFromSmallest } from '@/components/swap/utils/swapUtils';

export function useQuoteReceiveSync(
  quote: SwapQuoteResponsePayload | null | undefined,
  selectedToToken: UiToken | undefined,
  setToAmount: (updater: (current: string) => string) => void,
) {
  useEffect(() => {
    if (!quote || !selectedToToken) return;
    const next = formatAmountFromSmallest(
      quote.output.amount,
      selectedToToken.decimals,
    );
    setToAmount((current) => (current === next ? current : next));
  }, [quote, selectedToToken, setToAmount]);
}
