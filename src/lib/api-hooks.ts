'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchTokenRisk } from '@/lib/api';

export function useTokenRiskMutation() {
  return useMutation({
    mutationFn: (params: { chainId: number; tokenAddress: string }) =>
      fetchTokenRisk(params.chainId, params.tokenAddress),
  });
}
