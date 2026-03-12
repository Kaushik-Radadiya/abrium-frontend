'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTokenRisk } from '@/lib/api';
import type { UiToken } from '@/lib/tokens';

type CatalogTokensQueryData = {
  tokens: UiToken[];
  securitySyncing: boolean;
};

export function useTokenRiskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, params) => {
      const queryKey = ['catalog', 'tokens', params.chainId] as const;
      const cachedTokensData =
        queryClient.getQueryData<CatalogTokensQueryData>(queryKey);

      const cachedToken = cachedTokensData?.tokens.find(
        (token) =>
          token.address.toLowerCase() === params.tokenAddress.toLowerCase(),
      );

      if (cachedToken?.securityLevel) return;

      void queryClient.invalidateQueries({ queryKey });
    },
    mutationFn: (params: { chainId: number; tokenAddress: string }) =>
      fetchTokenRisk(params.chainId, params.tokenAddress),
  });
}
