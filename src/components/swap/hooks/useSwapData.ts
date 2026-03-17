'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SupportedChain, getChainKey } from '@/lib/chains';
import { listTokensForChain, UiToken } from '@/lib/tokens';
import {
  fetchCatalogChains,
  fetchCatalogTokens,
  importCatalogToken,
} from '@/lib/api.requests';
import { getChainIconUrl } from '@/lib/icons';
import { dedupeTokens } from '@/components/swap/utils';

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
  logoURI?: string;
};

type Params = {
  chainId: number;
  staticChains: SupportedChain[];
};

const EMPTY_TOKENS: UiToken[] = [];
const EMPTY_RUNTIME_NETWORKS: RuntimeNetwork[] = [];

export function useSwapData({ chainId, staticChains }: Params) {
  const queryClient = useQueryClient();

  const { data: dynamicRuntimeNetworks = EMPTY_RUNTIME_NETWORKS } = useQuery({
    queryKey: ['catalog', 'networks'],
    queryFn: async () => {
      const chains = await fetchCatalogChains();
      return chains.map((chain) => ({
        chain: {
          id: chain.id,
          name: chain.name,
          rpcUrls: [],
          explorerUrl: '',
          nativeSymbol: chain.nativeSymbol,
          scope: chain.scope,
        },
        chainKey: chain.chainKey,
        logoURI: chain.logoURI,
      })) satisfies RuntimeNetwork[];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const uniqueRuntimeNetworks = useMemo(() => {
    const map = new Map<number, RuntimeNetwork>();

    for (const chain of staticChains) {
      map.set(chain.id, { chain });
    }

    for (const network of dynamicRuntimeNetworks) {
      const existing = map.get(network.chain.id);
      if (!existing || (!existing.chainKey && network.chainKey)) {
        map.set(network.chain.id, network);
      }
    }

    return Array.from(map.values());
  }, [staticChains, dynamicRuntimeNetworks]);

  const selectedRuntimeNetwork = useMemo(() => {
    return uniqueRuntimeNetworks.find(
      (network) => network.chain.id === chainId,
    );
  }, [uniqueRuntimeNetworks, chainId]);

  const selectedNetwork = selectedRuntimeNetwork?.chain;

  const selectedChainKey = useMemo(() => {
    return selectedRuntimeNetwork?.chainKey ?? getChainKey(chainId);
  }, [chainId, selectedRuntimeNetwork]);

  const selectedChainIcon = useMemo(() => {
    if (selectedRuntimeNetwork?.logoURI) return selectedRuntimeNetwork.logoURI;
    if (!selectedChainKey) return null;
    return getChainIconUrl(selectedChainKey);
  }, [selectedChainKey, selectedRuntimeNetwork]);

  const { data: tokensQueryData, isLoading: loadingDynamicTokens } = useQuery({
    queryKey: ['catalog', 'tokens', chainId],
    queryFn: async () => {
      const { tokens, securitySyncing } = await fetchCatalogTokens(chainId);
      return { tokens: dedupeTokens(tokens), securitySyncing };
    },
    // When the backend is still syncing GoPlus security data in the background,
    // recheck every 30 s so security badges appear as soon as they are ready.
    refetchInterval: (query) =>
      query.state.data?.securitySyncing ? 30_000 : false,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const dynamicTokensForChain = tokensQueryData?.tokens ?? EMPTY_TOKENS;
  const securitySyncing = tokensQueryData?.securitySyncing ?? false;
  const dynamicTokensCount = dynamicTokensForChain.length;

  const chainTokens = useMemo(() => {
    if (dynamicTokensCount > 0) return dynamicTokensForChain;
    return listTokensForChain(chainId);
  }, [chainId, dynamicTokensCount, dynamicTokensForChain]);

  const importTokenByAddress = useCallback(
    async (address: `0x${string}`) => {
      const tokenData = await importCatalogToken(chainId, address);

      await queryClient.invalidateQueries({
        queryKey: ['catalog', 'tokens', chainId],
      });

      return tokenData;
    },
    [chainId, queryClient],
  );

  return {
    chainTokens,
    selectedNetwork,
    selectedChainKey,
    selectedChainIcon,
    uniqueRuntimeNetworks,
    loadingDynamicTokens,
    securitySyncing,
    importTokenByAddress,
  };
}
