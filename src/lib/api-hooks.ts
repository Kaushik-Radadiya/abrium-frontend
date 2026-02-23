'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchTokenRisk, TokenRiskResponse } from '@/lib/api';

export const QUERY_KEYS = {
  tokenRisk: (chainId: number, tokenAddress: string) =>
    ['token-risk', chainId, tokenAddress] as const,
};

export function useTokenRiskQuery(params: {
  chainId: number;
  tokenAddress?: string;
}) {
  const tokenAddress = params.tokenAddress?.toLowerCase() ?? '';
  const enabled = tokenAddress.length > 0 && tokenAddress !== 'native';

  return useQuery<TokenRiskResponse>({
    queryKey: QUERY_KEYS.tokenRisk(params.chainId, tokenAddress || 'native'),
    queryFn: () => fetchTokenRisk(params.chainId, tokenAddress),
    enabled,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useTokenRiskMutation() {
  return useMutation({
    mutationFn: (params: { chainId: number; tokenAddress: string }) =>
      fetchTokenRisk(params.chainId, params.tokenAddress),
  });
}
