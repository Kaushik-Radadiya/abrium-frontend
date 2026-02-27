'use client';

import { useQuery } from '@tanstack/react-query';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';
import { useDebouncedValue } from '@/components/swap/hooks/useDebouncedValue';
import { fetchSwapQuote, LiFiQuoteError } from '@/lib/api';

type Params = {
  request: SwapQuoteRequestPayload | null;
  debounceMs?: number;
};

export function useSwapQuote({ request, debounceMs = 350 }: Params) {
  const debouncedRequest = useDebouncedValue(request, debounceMs);

  return useQuery({
    queryKey: ['swap', 'quote', debouncedRequest],
    enabled: Boolean(debouncedRequest),
    queryFn: async () => {
      if (!debouncedRequest) return null;
      return fetchSwapQuote(debouncedRequest);
    },
    retry(failureCount, error) {
      if (error instanceof LiFiQuoteError) {
        if (error.noRouteFound) return false;
        if (
          error.status !== null &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
  });
}
