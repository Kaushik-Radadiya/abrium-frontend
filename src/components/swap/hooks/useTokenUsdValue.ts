'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTokenUsdPrice } from '@/lib/api';
import type { UiToken } from '@/lib/tokens';

type Params = {
  chainId: number;
  tokenAddress?: UiToken['address'] | null;
  amount: string;
  refetchIntervalMs?: number;
};

export function useTokenUsdValue({
  chainId,
  tokenAddress = null,
  amount,
  refetchIntervalMs = 60_000,
}: Params) {
  const normalizedAmount = useMemo(() => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value;
  }, [amount]);

  const { data: tokenUsdPrice = null } = useQuery({
    queryKey: ['coingecko', 'token-usd-price', chainId, tokenAddress],
    enabled: Boolean(tokenAddress),
    queryFn: async () => {
      if (!tokenAddress) return null;
      try {
        return await fetchTokenUsdPrice({
          chainId,
          tokenAddress,
        });
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    refetchInterval: refetchIntervalMs,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const usdValue = useMemo(() => {
    if (!tokenUsdPrice || normalizedAmount <= 0) return null;
    return normalizedAmount * tokenUsdPrice;
  }, [normalizedAmount, tokenUsdPrice]);

  return {
    usdValue,
    tokenUsdPrice,
  };
}
