'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  isAddress,
} from 'viem';
import { SupportedChain, getChainKey } from '@/lib/chains';
import { listTokensForChain, UiToken } from '@/lib/tokens';
import {
  fetchCatalogChains,
  fetchCatalogTokens,
  importCatalogToken,
} from '@/lib/api.requests';
import { getChainIconUrl } from '@/lib/icons';
import { dedupeTokens } from '@/components/swap/utils';
import { formatBalance } from '@/lib/formatAmount';

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
  logoURI?: string;
};

type Params = {
  chainId: number;
  staticChains: SupportedChain[];
  walletAddress?: string;
  selectedFromToken?: string;
  selectedToToken?: string;
};

const BALANCE_REFRESH_MS = 30_000;
const MULTICALL_CHUNK_SIZE = 100;
const EMPTY_TOKENS: UiToken[] = [];
const EMPTY_RUNTIME_NETWORKS: RuntimeNetwork[] = [];

// Multicall3 is deployed at the same address on all major EVM chains.
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

function createChainClient(rpcUrl: string, chainId: number) {
  return createPublicClient({
    chain: {
      id: chainId,
      name: 'EVM',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
      contracts: {
        multicall3: { address: MULTICALL3_ADDRESS },
      },
    },
    transport: http(rpcUrl),
  });
}

async function fetchBalancesForTokens(params: {
  rpcUrl: string;
  chainId: number;
  walletAddress: `0x${string}`;
  tokens: UiToken[];
}) {
  const client = createChainClient(params.rpcUrl, params.chainId);
  const next: Record<string, string> = Object.fromEntries(
    params.tokens.map((token) => [token.address.toLowerCase(), '0']),
  );
  const nativeTokens = params.tokens.filter(
    (token) => token.address === 'native',
  );
  const erc20Tokens = params.tokens.filter(
    (token): token is UiToken & { address: `0x${string}` } =>
      token.address !== 'native',
  );

  if (nativeTokens.length > 0) {
    try {
      const rawNativeBalance = await client.getBalance({
        address: params.walletAddress,
      });
      for (const token of nativeTokens) {
        next[token.address.toLowerCase()] = formatBalance(
          formatUnits(rawNativeBalance, token.decimals),
        );
      }
    } catch {}
  }

  for (
    let offset = 0;
    offset < erc20Tokens.length;
    offset += MULTICALL_CHUNK_SIZE
  ) {
    const chunk = erc20Tokens.slice(offset, offset + MULTICALL_CHUNK_SIZE);

    try {
      const chunkBalances = await client.multicall({
        allowFailure: true,
        contracts: chunk.map((token) => ({
          address: token.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [params.walletAddress],
        })),
      });

      chunkBalances.forEach((result, index) => {
        if (result.status !== 'success') return;
        const token = chunk[index];
        const rawBalance =
          typeof result.result === 'bigint'
            ? result.result
            : BigInt(result.result);
        next[token.address.toLowerCase()] = formatBalance(
          formatUnits(rawBalance, token.decimals),
        );
      });
    } catch {}
  }

  return next;
}

export function useSwapData({
  chainId,
  staticChains,
  walletAddress,
  selectedFromToken,
  selectedToToken,
}: Params) {
  const queryClient = useQueryClient();
  // Keyed by walletAddress then chainId — wallet change automatically scopes
  // balances without needing an explicit cache-clear effect.
  const [balancesByWalletChain, setBalancesByWalletChain] = useState<
    Record<string, Record<number, Record<string, string>>>
  >({});
  const [preferredRpcByChain, setPreferredRpcByChain] = useState<
    Record<number, string>
  >({});

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

  const selectedRpcUrls = useMemo(() => {
    const dynamicUrls = selectedNetwork?.rpcUrls ?? [];
    const staticUrls =
      staticChains.find((chain) => chain.id === chainId)?.rpcUrls ?? [];
    return Array.from(new Set([...dynamicUrls, ...staticUrls].filter(Boolean)));
  }, [selectedNetwork, staticChains, chainId]);

  const orderedRpcUrls = useMemo(() => {
    const preferred = preferredRpcByChain[chainId];
    if (!preferred) return selectedRpcUrls;
    return [preferred, ...selectedRpcUrls.filter((url) => url !== preferred)];
  }, [chainId, preferredRpcByChain, selectedRpcUrls]);

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

  const trackedBalanceTokens = useMemo(() => {
    const byAddress = new Map(
      chainTokens.map((token) => [token.address.toLowerCase(), token] as const),
    );
    const trackedAddresses = Array.from(
      new Set(
        [selectedFromToken, selectedToToken]
          .filter((value): value is string => Boolean(value))
          .map((value) => value.toLowerCase()),
      ),
    );

    return trackedAddresses
      .map((address) => byAddress.get(address))
      .filter((token): token is UiToken => Boolean(token));
  }, [chainTokens, selectedFromToken, selectedToToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadBalances() {
      if (!walletAddress || !isAddress(walletAddress)) return;

      // Tokens may still be loading for this chain — don't clear cache, just wait
      if (trackedBalanceTokens.length === 0) return;

      if (orderedRpcUrls.length === 0) return;

      let activeRpcUrl: string | null = null;
      for (const rpcUrl of orderedRpcUrls) {
        const probeClient = createChainClient(rpcUrl, chainId);
        try {
          await probeClient.getBlockNumber();
          activeRpcUrl = rpcUrl;
          setPreferredRpcByChain((prev) =>
            prev[chainId] === rpcUrl ? prev : { ...prev, [chainId]: rpcUrl },
          );
          break;
        } catch {}
      }

      if (!activeRpcUrl) {
        if (!cancelled) {
          const zeroBalances = trackedBalanceTokens.reduce<
            Record<string, string>
          >((acc, token) => {
            acc[token.address.toLowerCase()] = '0';
            return acc;
          }, {});
          setBalancesByWalletChain((prev) => ({
            ...prev,
            [walletAddress]: { ...prev[walletAddress], [chainId]: { ...prev[walletAddress]?.[chainId], ...zeroBalances } },
          }));
        }
        return;
      }

      const next = await fetchBalancesForTokens({
        rpcUrl: activeRpcUrl,
        chainId,
        walletAddress: walletAddress as `0x${string}`,
        tokens: trackedBalanceTokens,
      });

      if (!cancelled) {
        setBalancesByWalletChain((prev) => ({
          ...prev,
          [walletAddress]: { ...prev[walletAddress], [chainId]: { ...prev[walletAddress]?.[chainId], ...next } },
        }));
      }
    }

    void loadBalances();

    if (
      !walletAddress ||
      !isAddress(walletAddress) ||
      trackedBalanceTokens.length === 0 ||
      orderedRpcUrls.length === 0
    ) {
      return () => {
        cancelled = true;
      };
    }

    const intervalId = window.setInterval(() => {
      void loadBalances();
    }, BALANCE_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    walletAddress,
    chainId,
    orderedRpcUrls,
    trackedBalanceTokens,
  ]);

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
    balances: balancesByWalletChain[walletAddress ?? '']?.[chainId] ?? {},
    importTokenByAddress,
  };
}
