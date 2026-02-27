'use client';

import { useEffect } from 'react';
import type { UiToken } from '@/lib/tokens';

export function useFromTokenSync(
  chainTokens: UiToken[],
  fromToken: string,
  setFromToken: (address: string) => void,
) {
  useEffect(() => {
    if (chainTokens.length === 0) return;
    if (chainTokens.some((t) => t.address === fromToken)) return;

    const fallback =
      chainTokens.find((t) => t.address === 'native')?.address ??
      chainTokens[0]?.address ??
      'native';

    setFromToken(fallback);
  }, [chainTokens, fromToken, setFromToken]);
}

export function useToTokenSync(
  chainTokens: UiToken[],
  toToken: string,
  setToToken: (address: string) => void,
  resetRiskCheck: () => void,
) {
  useEffect(() => {
    resetRiskCheck();

    if (chainTokens.length === 0 || !toToken) return;
    if (!chainTokens.some((t) => t.address === toToken)) {
      setToToken('');
    }
  }, [chainTokens, toToken, setToToken, resetRiskCheck]);
}
