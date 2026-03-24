'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBestRoute, LiFiQuoteError } from '@/lib/lifi';
import { useDebouncedValue } from './useDebouncedValue';

type RankedRoutesParams = {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: string; // wei string
  userAddress: string;
} | null;

export function useRankedRoutesQuery(params: RankedRoutesParams) {
  const debounced = useDebouncedValue(params, 400);

  const isReady = Boolean(
    debounced?.fromToken &&
    debounced?.toToken &&
    debounced?.fromAmount &&
    debounced.fromAmount !== '0' &&
    debounced?.userAddress,
  );

  return useQuery({
    queryKey: ['ranked-routes', debounced],
    enabled: isReady,
    queryFn: async () => {
      if (!debounced) return null;
      return fetchBestRoute({
        tokenInChainId: debounced.fromChainId,
        tokenOutChainId: debounced.toChainId,
        tokenIn: debounced.fromToken,
        tokenOut: debounced.toToken,
        amount: debounced.fromAmount,
        swapper: debounced.userAddress,
        slippage: 0.005, // default — SSE endpoint replaces this in next step
      });
    },
    staleTime: 8_000,
    retry: (count, err) => {
      if (err instanceof LiFiQuoteError && err.noRouteFound) return false;
      return count < 1;
    },
    refetchOnWindowFocus: false,
  });
}
